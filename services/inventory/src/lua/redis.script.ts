export const LUA_TRY_HOLD = `
-- KEYS: list of nightly keys
-- ARGV[1]: ttl seconds
-- ARGV[2]: holdId
-- ARGV[3]: metadata json (optional)

-- check all KEYS are free
for i=1,#KEYS do
  if redis.call('EXISTS', KEYS[i]) == 1 then
    return {err="CONFLICT"}
  end
end

-- set all keys with value = holdId and expire
for i=1,#KEYS do
  redis.call('SET', KEYS[i], ARGV[2], 'NX', 'EX', tonumber(ARGV[1]))
end

-- store mapping hold:<holdId> -> metadata with same TTL
redis.call('SET', 'hold:'..ARGV[2], ARGV[3], 'EX', tonumber(ARGV[1]))

return 'OK'
`;
