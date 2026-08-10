USE bank_service_db;
 
-- Customers
INSERT INTO customers (id, pan_number, name, mobile_number, netbanking_username, netbanking_password) VALUES
(1, 'ABCPL1234D', 'Ramlal Patil', '9876543210', 'ramlal.patil', 'demo@1234'),
(2, 'BXYPS5678E', 'Anita Sharma', '9876543211', 'anita.sharma', 'demo@1234'),
(3, 'CQRTV9012F', 'Vikram Deshmukh', '9876543212', 'vikram.deshmukh', 'demo@1234');
 
-- Accounts
INSERT INTO accounts (id, customer_id, bank_name, account_number, ifsc, balance) VALUES
(1, 1, 'HDFC', 'AC1000234567', 'HDFC0001234', 42500.00),
(2, 1, 'SBI',  'AC2000998877', 'SBIN0004567', 15800.00),
(3, 2, 'HDFC', 'AC1000234568', 'HDFC0001234', 76200.00),
(4, 3, 'ICICI','AC3000556644', 'ICIC0007890', 15300.00);
 
-- Transactions: Ramlal Patil (account_id = 1) - farmer profile
INSERT INTO transactions (account_id, txn_date, description, amount, type) VALUES
(1, '2026-02-05', 'Crop sale credit - Mandi', 18000, 'CREDIT'),
(1, '2026-02-10', 'EMI - Existing tractor loan', -4500, 'DEBIT'),
(1, '2026-02-22', 'Fertilizer purchase', -3200, 'DEBIT'),
(1, '2026-03-01', 'EMI - Existing tractor loan', -4500, 'DEBIT'),
(1, '2026-03-15', 'Crop sale credit - Mandi', 21000, 'CREDIT'),
(1, '2026-03-28', 'Household expense', -2600, 'DEBIT'),
(1, '2026-04-01', 'EMI - Existing tractor loan', -4500, 'DEBIT'),
(1, '2026-04-20', 'Medical expense', -2800, 'DEBIT'),
(1, '2026-05-01', 'EMI - Existing tractor loan', -4500, 'DEBIT'),
(1, '2026-05-18', 'Crop sale credit - Mandi', 25000, 'CREDIT'),
(1, '2026-05-25', 'Seeds purchase', -1800, 'DEBIT'),
(1, '2026-06-01', 'EMI - Existing tractor loan', -4500, 'DEBIT'),
(1, '2026-06-14', 'Household expense', -3500, 'DEBIT'),
(1, '2026-07-01', 'EMI - Existing tractor loan', -4500, 'DEBIT'),
(1, '2026-07-20', 'Crop sale credit - Mandi', 19500, 'CREDIT');
 
-- Transactions: Anita Sharma (account_id = 3) - salaried profile
INSERT INTO transactions (account_id, txn_date, description, amount, type) VALUES
(3, '2026-02-01', 'Salary credit', 35000, 'CREDIT'),
(3, '2026-02-05', 'Rent payment', -12000, 'DEBIT'),
(3, '2026-02-12', 'Electricity bill', -1850, 'DEBIT'),
(3, '2026-03-01', 'Salary credit', 35000, 'CREDIT'),
(3, '2026-03-05', 'Rent payment', -12000, 'DEBIT'),
(3, '2026-03-18', 'Grocery - UPI', -4200, 'DEBIT'),
(3, '2026-04-01', 'Salary credit', 35000, 'CREDIT'),
(3, '2026-04-05', 'Rent payment', -12000, 'DEBIT'),
(3, '2026-04-22', 'Mobile recharge', -799, 'DEBIT'),
(3, '2026-05-01', 'Salary credit', 35000, 'CREDIT'),
(3, '2026-05-05', 'Rent payment', -12000, 'DEBIT'),
(3, '2026-06-01', 'Salary credit', 35000, 'CREDIT'),
(3, '2026-06-05', 'Rent payment', -12000, 'DEBIT'),
(3, '2026-07-01', 'Salary credit', 35000, 'CREDIT'),
(3, '2026-07-05', 'Rent payment', -12000, 'DEBIT');
 
-- Transactions: Vikram Deshmukh (account_id = 4) - risky/defaulted profile
INSERT INTO transactions (account_id, txn_date, description, amount, type) VALUES
(4, '2026-02-10', 'Freelance income', 12000, 'CREDIT'),
(4, '2026-02-15', 'Credit card bill', -8000, 'DEBIT'),
(4, '2026-03-10', 'Freelance income', 9500, 'CREDIT'),
(4, '2026-03-15', 'Credit card bill', -7000, 'DEBIT'),
(4, '2026-04-10', 'Freelance income', 14000, 'CREDIT'),
(4, '2026-04-15', 'Credit card bill', -9000, 'DEBIT'),
(4, '2026-05-10', 'Freelance income', 6000, 'CREDIT'),
(4, '2026-05-20', 'Credit card bill - partial', -4000, 'DEBIT'),
(4, '2026-06-12', 'Freelance income', 5500, 'CREDIT');
 
-- Loan history
INSERT INTO loan_history (account_id, loan_type, amount, status) VALUES
(1, 'Tractor Loan', 250000, 'ONGOING'),
(3, 'Personal Loan', 80000, 'CLOSED'),
(4, 'Personal Loan', 100000, 'DEFAULTED');

SELECT * FROM transactions;