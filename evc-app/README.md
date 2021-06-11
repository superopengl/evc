# Maintainence scripts

## Check current database connections
```sql
SELECT numbackends
FROM pg_stat_database
where datname = 'evcprod'
```

## Reset database stat
```sql
# Reset current database stat
SELECT pg_stat_reset(); 
```