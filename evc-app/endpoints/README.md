# Daily job
1. Fetch daily close price and calculate daily PE
2. Fetch EPS if there is (should update every quarter)
3. Fetch putCallRatio
4. Refresh all materialized views (tech)
5. Check subscription expirations and 
   1. do recurring payment if opt-in recurring payment
   2. do alerts if opt-out recurring payment
6. Retire supports/resitances based on the daily close price.
7. Send alerts if close price exceeded fair value range (becomes over-valued or under-valued)