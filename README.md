# BlueWave
Bluewave is a distributed workflow engine which automates any given workflow by dividing it into a list of tasks. 

# Technologies used:
- Spring Boot
- Angular 4
- Angular Material
- Cassandra
- Redis
- MongoDB
- MySQL
- Apache Kafka
- Docker 
- OAuth used for Authentication.
- Socket used for Browser to Backend interactive communication.


### Execution of a workflow is called a Job and each and every execution has a unique identifier called Job ID.

# Bluewave Architecture:
- API Gateway
- Discovery Service
- Eureka Server
- Authentication Service
- User Persistence
- Workflow Persistence
- Engine
- Reporting Service
- Socket Service


More about architecture
- Microservice based architecture.
- Used Apache Kafka message bus for decoupling microservices.
- Used docker for deploying on AWS.

# Engine Architecture:
- Common Redis Database for all instances of the engine. All parts of the engine communicate through Apache Kafka.
- State Initialiser: Initialises the engine and checks if there are any pending jobs and if it finds any pending jobs, picks up from the Redis database.
- Job Scheduler: It is responsible for scheduling the jobs and updating status of the job.
- Task Scheduler: After a job has been scheduled, the task scheduler receives the tasks to be executed from the Job Scheduler and it triggers the respective tasks.
- Agent: Agent is responsible for interacting with the task, giving it inputs, executing it and collecting any outputs from them.
- Result Processor: Agent sends the exit code and any output to Result Processor, and the same is send back to Job Scheduler which updates the same in Redis and schedules next tasks or jobs and this cycle continues until all jobs have been completed or a new jobs comes in.
