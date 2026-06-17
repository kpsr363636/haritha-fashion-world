#!/bin/bash
# Deploy backend JAR to EC2
EC2_IP="13.126.76.32"
KEY_FILE="/Users/purushothamreddy/harithafashionworld/haritha-backend-key.pem"
JAR_PATH="/Users/purushothamreddy/harithafashionworld/backend/target/haritha-fashion-*.jar"

echo "Copying JAR to EC2..."
scp -i "$KEY_FILE" -o StrictHostKeyChecking=no $JAR_PATH ec2-user@$EC2_IP:~/app.jar

echo "Sending startup script..."
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no ec2-user@$EC2_IP << 'REMOTE'
# Install Java 17 if not present
if ! java -version 2>&1 | grep -q "17"; then
  sudo dnf install -y java-17-amazon-corretto-headless
fi

# Stop old instance if running
sudo pkill -f "app.jar" || true
sleep 2

# Write environment file
cat > ~/app.env << 'ENV'
SPRING_DATASOURCE_URL=jdbc:postgresql://haritha-fashion-db.c3oy8yq4scpe.ap-south-1.rds.amazonaws.com:5432/harithafashion
SPRING_DATASOURCE_USERNAME=haritha_admin
SPRING_DATASOURCE_PASSWORD=HarithaDB2024xYz9
SPRING_REDIS_HOST=haritha-redis.wewdrr.0001.aps1.cache.amazonaws.com
SPRING_REDIS_PORT=6379
JWT_SECRET=HarithaFashionWorldJwtSecretKey2024ProductionUseOnly
AWS_S3_BUCKET_NAME=haritha-fashion-world-assets
AWS_REGION=ap-south-1
FRONTEND_URL=https://d24jhhd7zycr93.cloudfront.net
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080
ENV

# Start the application
nohup env $(cat ~/app.env | xargs) java -Xms256m -Xmx512m -jar ~/app.jar > ~/app.log 2>&1 &
echo "Backend started, PID: $!"
sleep 5
tail -20 ~/app.log
REMOTE
echo "Deploy complete ✅"
