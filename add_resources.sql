-- Adiciona 5000 Ouro e 20 Diamantes para o usuário davidmonteiro0122@gmail.com

UPDATE public.profiles
SET 
    gold = gold + 5000, 
    diamonds = diamonds + 20
FROM auth.users
WHERE profiles.user_id = auth.users.id
AND auth.users.email = 'davidmonteiro0122@gmail.com';

-- Verifica o novo saldo
SELECT username, gold, diamonds 
FROM public.profiles
JOIN auth.users ON profiles.user_id = auth.users.id
WHERE auth.users.email = 'davidmonteiro0122@gmail.com';
