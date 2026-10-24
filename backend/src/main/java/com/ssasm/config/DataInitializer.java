package com.ssasm.config;

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
 * Production-ready bootstrapper that only sets up core roles and the master Administrator account.
 * No mock or test societies, flats, residents, or complaints are populated.
 */
@Configuration
public class DataInitializer {

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
      com.ssasm.repository.society.SocietyRepository societyRepository) {
    return args -> {
      // 1. Ensure core roles exist
      Role adminRole = getOrCreateRole(roleRepository, RoleName.SOCIETY_ADMIN, "Society Admin Authority");
      Role residentRole = getOrCreateRole(roleRepository, RoleName.RESIDENT, "Resident Account");
      Role guardRole = getOrCreateRole(roleRepository, RoleName.SECURITY_GUARD, "Gate Security Guard Account");
      Role staffRole = getOrCreateRole(roleRepository, RoleName.SOCIETY_STAFF, "Society Maintenance Staff Account");

      // 2. Ensure official department login accounts exist (Staff, Guard, Admin)
      getOrCreateUser(userRepository, passwordEncoder, "admin", "admin@society.local", "+91 98765 00001", "Society Administrator", adminRole, "admin123");
      getOrCreateUser(userRepository, passwordEncoder, "guard", "guard@society.local", "+91 98765 00003", "Gate Security Guard", guardRole, "guard123");
      getOrCreateUser(userRepository, passwordEncoder, "staff", "staff@society.local", "+91 98765 00004", "Maintenance Staff", staffRole, "staff123");
      
      // Ensure abhishek resident account has known password abhishek123
      userRepository.findByUsernameIgnoreCase("abhishek").ifPresent(user -> {
        user.setPasswordHash(passwordEncoder.encode("abhishek123"));
        userRepository.save(user);
      });

      // 3. Ensure Staff entity exists for staff user
      userRepository.findByUsernameIgnoreCase("staff").ifPresent(staffUser -> {
        if (staffRepository.count() == 0) {
          com.ssasm.entity.community.Staff staffMember = new com.ssasm.entity.community.Staff();
          staffMember.setFullName("Rajesh Kumar (Maintenance Lead)");
          staffMember.setSpecialization("Electrical & Plumbing");
          staffMember.setPhoneNumber("+91 98765 00004");
          staffMember.setEmail("staff@society.local");
          staffMember.setWorkStatus("AVAILABLE");
          staffMember.setUser(staffUser);
          staffMember.setCreatedBy("SYSTEM");
          staffMember.setUpdatedBy("SYSTEM");
          staffRepository.save(staffMember);
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
