--! Previous: sha1:69b2c8c585ebc4fac825603f5e103e7d54c17722
--! Hash: sha1:482eee9a139de8fe272e27ebe4d943a665718fd7
--! Message: Added Phone number filed

-- Enter migration here
ALTER TABLE users
ADD COLUMN phone_number VARCHAR(20);
