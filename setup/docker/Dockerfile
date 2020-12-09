FROM mysql

#create new DB
ENV MYSQL_DATABASE testdb

# DbSetup.sql file has initial DB setup commands
# All scripts in docker-entrypoint-initdb.d/ are automatically
# executed during container startup
ADD DbSetup.sql /docker-entrypoint-initdb.d/DbSetup.sql