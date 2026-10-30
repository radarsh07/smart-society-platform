package com.ssasm.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import com.ssasm.entity.auth.Role;
import com.ssasm.entity.auth.User;
import com.ssasm.enums.AccountStatus;
import com.ssasm.enums.RoleName;
import com.ssasm.repository.auth.RoleRepository;
import com.ssasm.repository.auth.UserRepository;

/**
 * Production-ready bootstrapper that sets up core roles and default accounts.
 * Safely handles cloud databases that may be delayed or sleeping on startup.
 */
@Configuration
public class DataInitializer {

  private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

  @Bean
  @Order(2)
  @Transactional
  public CommandLineRunner bootstrapSystem(
      RoleRepository roleRepository,
      UserRepository userRepository,
      PasswordEncoder passwordEncoder,
      com.ssasm.repository.community.StaffRepository staffRepository,
      com.ssasm.repository.community.ComplaintCategoryRepository complaintCategoryRepository,
      com.ssasm.repository.community.FacilityRepository facilityRepository,
      com.ssasm.repository.community.ParkingSlotRepository parkingSlotRepository,
      com.ssasm.repository.society.SocietyRepository societyRepository,
      com.ssasm.repository.society.BuildingRepository buildingRepository,
      com.ssasm.repository.society.FlatRepository flatRepository,
      com.ssasm.repository.society.ResidentRepository residentRepository) {
    return args -> {
      try {
        log.info("Starting initial database role and admin account verification...");

        // 1. Ensure core roles exist
        Role adminRole = getOrCreateRole(roleRepository, RoleName.SOCIETY_ADMIN, "Society Admin Authority");
        Role residentRole = getOrCreateRole(roleRepository, RoleName.RESIDENT, "Resident Account");
        Role guardRole = getOrCreateRole(roleRepository, RoleName.SECURITY_GUARD, "Gate Security Guard Account");
        Role staffRole = getOrCreateRole(roleRepository, RoleName.SOCIETY_STAFF, "Society Maintenance Staff Account");

        // 2. Ensure official department login accounts exist (Staff, Guard, Admin, Resident)
        getOrCreateUser(userRepository, passwordEncoder, "admin", "admin@society.local", "+91 98765 00001", "Society Administrator", adminRole, "admin123");
        getOrCreateUser(userRepository, passwordEncoder, "guard", "guard@society.local", "+91 98765 00003", "Gate Security Guard", guardRole, "guard123");
        User defaultStaffUser = getOrCreateUser(userRepository, passwordEncoder, "staff", "staff@society.local", "+91 98765 00004", "Maintenance Staff", staffRole, "staff123");
        User electricianUser = getOrCreateUser(userRepository, passwordEncoder, "electrician", "electrician@society.local", "+91 98765 00011", "Vikram Singh (Electrician)", staffRole, "staff123");
        User plumberUser = getOrCreateUser(userRepository, passwordEncoder, "plumber", "plumber@society.local", "+91 98765 00012", "Ramesh Rao (Plumber)", staffRole, "staff123");
        User abhishekUser = getOrCreateUser(userRepository, passwordEncoder, "abhishek", "abhishek@society.local", "+919989786536", "Abhishek", residentRole, "abhishek123");

        // Ensure abhishek resident account has known password abhishek123 if previously existed with another password
        if (!passwordEncoder.matches("abhishek123", abhishekUser.getPasswordHash())) {
          abhishekUser.setPasswordHash(passwordEncoder.encode("abhishek123"));
          abhishekUser = userRepository.save(abhishekUser);
        }

        // Ensure default Society, Building, Flat, and Resident exist
        com.ssasm.entity.society.Society defaultSociety = societyRepository.findAll().stream().filter(s -> !s.isDeleted()).findFirst().orElseGet(() -> {
          com.ssasm.entity.society.Society s = new com.ssasm.entity.society.Society();
          s.setSocietyName("SHIV ELITE TOWNSHIP");
          s.setRegistrationNumber("REG-SOC-2026-001");
          s.setAddressLine1("Sector 42, Golf Course Road");
          s.setCity("Gurugram");
          s.setState("Haryana");
          s.setPincode("122002");
          s.setContactPhone("+91 98765 00001");
          s.setCreatedBy("SYSTEM");
          s.setUpdatedBy("SYSTEM");
          return societyRepository.save(s);
        });

        com.ssasm.entity.society.Building defaultBuilding = buildingRepository.findAll().stream().filter(b -> !b.isDeleted()).findFirst().orElseGet(() -> {
          com.ssasm.entity.society.Building b = new com.ssasm.entity.society.Building();
          b.setBuildingName("Lavender");
          b.setBuildingCode("LAV");
          b.setTotalFloors(10);
          b.setSociety(defaultSociety);
          b.setCreatedBy("SYSTEM");
          b.setUpdatedBy("SYSTEM");
          return buildingRepository.save(b);
        });

        com.ssasm.entity.society.Flat defaultFlat = flatRepository.findAll().stream().filter(f -> !f.isDeleted()).findFirst().orElseGet(() -> {
          com.ssasm.entity.society.Flat f = new com.ssasm.entity.society.Flat();
          f.setFlatNumber("101");
          f.setFlatType("3BHK");
          f.setFloorNumber(1);
          f.setCarpetArea(1450.0);
          f.setStatus("OCCUPIED");
          f.setBuilding(defaultBuilding);
          f.setCreatedBy("SYSTEM");
          f.setUpdatedBy("SYSTEM");
          return flatRepository.save(f);
        });

        final User finalAbhishekUser = abhishekUser;
        final com.ssasm.entity.society.Flat finalDefaultFlat = defaultFlat;
        if (residentRepository.count() == 0) {
          com.ssasm.entity.society.Resident resident = new com.ssasm.entity.society.Resident();
          resident.setUser(finalAbhishekUser);
          resident.setFlat(finalDefaultFlat);
          resident.setFullName("Abhishek");
          resident.setEmail("abhishek@society.local");
          resident.setPhoneNumber("+919989786536");
          resident.setOccupancyType("OWNER");
          resident.setResidentStatus("ACTIVE");
          resident.setCreatedBy("SYSTEM");
          resident.setUpdatedBy("SYSTEM");
          residentRepository.save(resident);
        }

        // 3. Ensure Staff entities exist for staff users
        if (staffRepository.count() == 0) {
          com.ssasm.entity.community.Staff leadStaff = new com.ssasm.entity.community.Staff();
          leadStaff.setFullName("Rajesh Kumar (Maintenance Lead)");
          leadStaff.setSpecialization("General Maintenance");
          leadStaff.setPhoneNumber("+91 98765 00004");
          leadStaff.setEmail("staff@society.local");
          leadStaff.setWorkStatus("AVAILABLE");
          leadStaff.setUser(defaultStaffUser);
          leadStaff.setCreatedBy("SYSTEM");
          leadStaff.setUpdatedBy("SYSTEM");
          staffRepository.save(leadStaff);
        }

        // Ensure dedicated electrician staff exists
        boolean hasElectrician = staffRepository.findByDeletedFalse().stream()
            .anyMatch(s -> s.getSpecialization() != null && s.getSpecialization().toLowerCase().contains("electric"));
        if (!hasElectrician) {
          com.ssasm.entity.community.Staff electricStaff = new com.ssasm.entity.community.Staff();
          electricStaff.setFullName("Vikram Singh (Certified Electrician)");
          electricStaff.setSpecialization("Electrical Maintenance");
          electricStaff.setPhoneNumber("+91 98765 00011");
          electricStaff.setEmail("electrician@society.local");
          electricStaff.setWorkStatus("AVAILABLE");
          electricStaff.setUser(electricianUser);
          electricStaff.setCreatedBy("SYSTEM");
          electricStaff.setUpdatedBy("SYSTEM");
          staffRepository.save(electricStaff);
        }

        // Ensure dedicated plumber staff exists
        boolean hasPlumber = staffRepository.findByDeletedFalse().stream()
            .anyMatch(s -> s.getSpecialization() != null && s.getSpecialization().toLowerCase().contains("plumb"));
        if (!hasPlumber) {
          com.ssasm.entity.community.Staff plumbStaff = new com.ssasm.entity.community.Staff();
          plumbStaff.setFullName("Ramesh Rao (Plumbing Specialist)");
          plumbStaff.setSpecialization("Plumbing Services");
          plumbStaff.setPhoneNumber("+91 98765 00012");
          plumbStaff.setEmail("plumber@society.local");
          plumbStaff.setWorkStatus("AVAILABLE");
          plumbStaff.setUser(plumberUser);
          plumbStaff.setCreatedBy("SYSTEM");
          plumbStaff.setUpdatedBy("SYSTEM");
          staffRepository.save(plumbStaff);
        }

        // Make sure all existing staff default to AVAILABLE if workStatus is empty
        staffRepository.findByDeletedFalse().forEach(s -> {
          if (s.getWorkStatus() == null || s.getWorkStatus().isBlank()) {
            s.setWorkStatus("AVAILABLE");
            staffRepository.save(s);
          }
        });

        // 4. Seed master Complaint Categories if empty
        if (complaintCategoryRepository.count() == 0) {
          String[][] categories = {
              {"Plumbing", "Pipe leak, tap breakdown, water supply issues"},
              {"Electrical", "Power tripping, lights, switchboard faults"},
              {"Elevator / Lift", "Lift stopped, abnormal vibration, alarm"},
              {"Cleanliness & Waste", "Garbage clearance, corridor cleaning, pest control"},
              {"Security & Access", "Gate pass issue, intercom fault, trespassing"},
              {"General Maintenance", "Common area amenities, painting, civil maintenance"}
          };
          for (String[] cat : categories) {
            com.ssasm.entity.community.ComplaintCategory c = new com.ssasm.entity.community.ComplaintCategory();
            c.setName(cat[0]);
            c.setDescription(cat[1]);
            c.setCreatedBy("SYSTEM");
            c.setUpdatedBy("SYSTEM");
            complaintCategoryRepository.save(c);
          }
        }

        // 5. Seed Facilities if empty
        if (facilityRepository.count() == 0) {
          com.ssasm.entity.society.Society society = societyRepository.findAll().stream().filter(s -> !s.isDeleted()).findFirst().orElse(null);
          Object[][] facilities = {
              {"Clubhouse", "Air-conditioned hall with audio system & party seating.", 120},
              {"Swimming Pool", "Olympic-size pool with safety guard & sun loungers.", 60},
              {"Community Gymnasium", "Fully equipped weights & cardio fitness station.", 90},
              {"Tennis & Badminton Court", "Synthetic turf court with night floodlights.", 60}
          };
          for (Object[] fac : facilities) {
            com.ssasm.entity.community.Facility f = new com.ssasm.entity.community.Facility();
            f.setName((String) fac[0]);
            f.setDescription((String) fac[1]);
            f.setBookingDurationMinutes((Integer) fac[2]);
            f.setSociety(society);
            f.setCreatedBy("SYSTEM");
            f.setUpdatedBy("SYSTEM");
            facilityRepository.save(f);
          }
        }

        // 6. Seed Parking Slots if empty
        if (parkingSlotRepository.count() == 0) {
          com.ssasm.entity.society.Society society = societyRepository.findAll().stream().filter(s -> !s.isDeleted()).findFirst().orElse(null);
          for (int i = 1; i <= 10; i++) {
            com.ssasm.entity.community.ParkingSlot slot = new com.ssasm.entity.community.ParkingSlot();
            slot.setSlotNumber("P-" + String.format("%02d", i));
            slot.setSlotType(i <= 3 ? "COVERED" : "STANDARD");
            slot.setOccupied(false);
            slot.setSociety(society);
            slot.setCreatedBy("SYSTEM");
            slot.setUpdatedBy("SYSTEM");
            parkingSlotRepository.save(slot);
          }
        }
        log.info("Database bootstrap completed successfully.");
      } catch (Exception ex) {
        log.warn("Database initialization deferred: unable to connect to database during startup ({}). The server will remain running.", ex.getMessage());
      }
    };
  }

  private Role getOrCreateRole(RoleRepository roleRepository, RoleName roleName, String description) {
    return roleRepository.findByName(roleName)
        .orElseGet(() -> roleRepository.save(new Role(roleName, description)));
  }

  private User getOrCreateUser(
      UserRepository userRepository,
      PasswordEncoder passwordEncoder,
      String username,
      String email,
      String phone,
      String fullName,
      Role role,
      String password) {
    return userRepository.findByUsernameIgnoreCase(username)
        .orElseGet(() -> {
          User u = new User();
          u.setUsername(username);
          u.setPasswordHash(passwordEncoder.encode(password));
          u.setEmail(email);
          u.setPhoneNumber(phone);
          u.setFullName(fullName);
          u.setRole(role);
          u.setAccountStatus(AccountStatus.ACTIVE);
          u.setCreatedBy("SYSTEM");
          u.setUpdatedBy("SYSTEM");
          return userRepository.save(u);
        });
  }
}
