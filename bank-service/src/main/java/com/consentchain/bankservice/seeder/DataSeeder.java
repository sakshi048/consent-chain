package com.consentchain.bankservice.seeder;

import com.consentchain.bankservice.model.BankAccount;
import com.consentchain.bankservice.repository.BankAccountRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final BankAccountRepository bankAccountRepository;

    public DataSeeder(BankAccountRepository bankAccountRepository) {
        this.bankAccountRepository = bankAccountRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        BankAccount acc1 = new BankAccount();
        acc1.setAccountNumber("SBIN0001234");
        acc1.setIfscCode("SBIN0000001");
        acc1.setHolderName("Sakshi Gharat");
        acc1.setBalance(50000.0);

        BankAccount acc2 = new BankAccount();
        acc2.setAccountNumber("HDFC0005678");
        acc2.setIfscCode("HDFC0000002");
        acc2.setHolderName("Bhunesh Naik");
        acc2.setBalance(75000.0);

        BankAccount acc3 = new BankAccount();
        acc3.setAccountNumber("ICIC0009999");
        acc3.setIfscCode("ICIC0000003");
        acc3.setHolderName("Rohit Mahajan");
        acc3.setBalance(120000.0);

        bankAccountRepository.save(acc1);
        bankAccountRepository.save(acc2);
        bankAccountRepository.save(acc3);

        System.out.println("Seed data loaded: 3 bank accounts");
    }
}