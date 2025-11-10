insert into funds (code, name, description, currency, target_amount, min_commitment, status)
values ('GREENWAVE', 'GreenWave Energy Fund', 'Green energy SPV (AT/EU).', 'EUR', 5000000, 1000, 'open')
on conflict (code) do nothing;

insert into app_users (email, full_name, role, password_hash)
values ('admin@eut.local', 'EUT Admin', 'admin', crypt('admin123', gen_salt('bf')))
on conflict (email) do nothing;

insert into app_users (email, full_name, role, password_hash)
values ('investor@eut.local', 'Test Investor', 'investor', crypt('invest123', gen_salt('bf')))
on conflict (email) do nothing;
