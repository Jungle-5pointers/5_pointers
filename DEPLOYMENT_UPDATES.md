# PageCube AWS Deployment Updates

## Summary of Changes

Updated all deployment configurations to align with the current AWS architecture as described in the provided documentation.

## Files Modified

### 1. `.github/workflows/subdomain-server.yml` (NEW)
- **Purpose**: Automated deployment of subdomain server to EC2 instance
- **Key Features**:
  - Deploys to `PageCube-Subdomain-Simple` EC2 instance (IP: 3.35.141.231)
  - Uses AWS Systems Manager for deployment commands
  - Includes PM2 process management for production stability
  - Configures Nginx for subdomain routing
  - Dynamic instance ID detection
  - Health check endpoint

### 2. `subdomain-server.js` (UPDATED)
- **Changes**:
  - Updated API_BASE_URL to use Elastic Beanstalk endpoint: `https://jungle-backend-prod-env.eba-ftfwcygq.ap-northeast-2.elasticbeanstalk.com/api`
  - Added CORS middleware for cross-origin requests
  - Added health check endpoint at `/health`
  - Made PORT configurable via environment variable

### 3. `deployment-script.sh` (UPDATED)
- **Changes**:
  - Updated RDS endpoint to: `jungle-db5-instance-1.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com`
  - Fixed database connection parameters

### 4. `fix-subdomain-deployment.sh` (UPDATED)
- **Changes**:
  - Updated RDS endpoint to match Aurora MySQL cluster
  - Added API_BASE_URL environment variable for subdomain server

### 5. `.github/workflows/deploy-backend.yml` (UPDATED)
- **Changes**:
  - Added database connection environment variables
  - Configured RDS Aurora MySQL endpoint
  - Enhanced environment variable setup for production

### 6. `get-instance-id.sh` (NEW)
- **Purpose**: Dynamic EC2 instance ID retrieval
- **Usage**: Finds `PageCube-Subdomain-Simple` instance ID for deployment scripts

## AWS Architecture Alignment

### Current Infrastructure:
- **Frontend**: S3 bucket `jungle-frontend-5` with CloudFront distribution
- **Backend**: Elastic Beanstalk application `jungle-backend-prod`
- **Database**: Aurora MySQL cluster `jungle-db5`
- **Subdomain Server**: EC2 instance `PageCube-Subdomain-Simple` (t3.micro)

### Updated Endpoints:
- **Backend API**: `https://jungle-backend-prod-env.eba-ftfwcygq.ap-northeast-2.elasticbeanstalk.com/api`
- **Database**: `jungle-db5-instance-1.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com:3306`
- **Subdomain Server**: `http://3.35.141.231:3001`

## Deployment Workflow

### 1. Backend Deployment
- Triggered on changes to `backend/**`
- Deploys to Elastic Beanstalk environment `Jungle-backend-prod-env`
- Uses Aurora MySQL for data persistence

### 2. Frontend Deployment
- Triggered on changes to `my-web-builder/**`
- Deploys to S3 bucket `jungle-frontend-5`
- Invalidates CloudFront distribution `E1YH7W2565N4LY`

### 3. Subdomain Server Deployment (NEW)
- Triggered on changes to subdomain-related files
- Deploys to EC2 instance `PageCube-Subdomain-Simple`
- Uses PM2 for process management
- Configures Nginx for wildcard subdomain routing

## Security Considerations

- **하드코딩 제거**: 모든 민감한 정보는 GitHub Secrets에 저장
- **환경 변수 사용**: DB 연결 정보, API 키 등은 환경 변수로 관리
- **데이터베이스 보안**: 암호화된 Aurora MySQL 사용
- **HTTPS/TLS**: CloudFront 레벨에서 SSL 종료
- **VPC 보안 그룹**: 서비스 간 접근 제어
- **최소 권한 원칙**: AWS IAM 역할에 필요한 최소 권한만 부여

## 필요한 GitHub Secrets

### AWS 관련
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN`

### 데이터베이스 관련
- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_DATABASE`

### OAuth 관련
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `KAKAO_REST_API_KEY`
- `KAKAO_CLIENT_SECRET`
- `KAKAO_JAVASCRIPT_KEY`

### 기타
- `JWT_SECRET`

## Monitoring & Health Checks

- Health check endpoint at `/health` for subdomain server
- PM2 process monitoring for subdomain server
- CloudWatch logs for all AWS services
- Elastic Beanstalk health dashboard for backend

## Next Steps

1. **DNS Configuration**: Ensure wildcard DNS (*.pagecube.net) points to subdomain server IP
2. **SSL/TLS**: Consider adding SSL certificate for subdomain server
3. **Monitoring**: Set up CloudWatch alarms for EC2 instance health
4. **Auto-scaling**: Consider auto-scaling group for subdomain server if needed
5. **Load Balancing**: Add ALB if multiple subdomain server instances are required

## Usage

To deploy:
1. Backend: Push changes to `backend/**` files
2. Frontend: Push changes to `my-web-builder/**` files  
3. Subdomain Server: Push changes to `subdomain-server.js` or related files

All deployments are automated through GitHub Actions.