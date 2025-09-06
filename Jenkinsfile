pipeline {
    agent any
    
    parameters {
        string(name: 'VPS_IP', defaultValue: '72.60.99.67', description: 'VPS IP Address')
        string(name: 'VPS_USER', defaultValue: 'root', description: 'VPS Username')
        string(name: 'DEPLOY_PATH', defaultValue: '/var/www/html/test-reports', description: 'Deployment Path on VPS')
        string(name: 'PROJECT_NAME', defaultValue: 'api-test-framework', description: 'Project Name')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Run API Tests') {
            steps {
                // Simulate API test execution
                sh '''
                    mkdir -p allure-results logs
                    echo "API Test Results" > allure-results/test-result.json
                    echo "$(date): API tests completed successfully" > logs/combined.log
                    echo "$(date): No errors found" > logs/error.log
                '''
            }
        }
        
        stage('Generate Mock Allure Report') {
            steps {
                // Create mock allure report
                sh '''
                    mkdir -p allure-report
                    cat > allure-report/index.html << EOF
<!DOCTYPE html>
<html>
<head><title>API Test Results</title></head>
<body>
    <h1>API Test Framework Results</h1>
    <p>Build: ${BUILD_NUMBER}</p>
    <p>Status: All tests passed</p>
    <p>Total Tests: 15</p>
    <p>Passed: 15</p>
    <p>Failed: 0</p>
</body>
</html>
EOF
                '''
            }
        }
        
        stage('Deploy to Hostinger VPS') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'hostinger-ssh-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                    script {
                        def timestamp = new Date().format('yyyy-MM-dd_HH-mm-ss')
                        def buildFolder = "build-${BUILD_NUMBER}-${timestamp}"
                        
                        sh """
                            # Create project-specific folders
                            ssh -i \$SSH_KEY -o StrictHostKeyChecking=no ${params.VPS_USER}@${params.VPS_IP} "mkdir -p ${params.DEPLOY_PATH}/${params.PROJECT_NAME}/${buildFolder}"
                            ssh -i \$SSH_KEY -o StrictHostKeyChecking=no ${params.VPS_USER}@${params.VPS_IP} "mkdir -p ${params.DEPLOY_PATH}/${params.PROJECT_NAME}/latest"

                            # Copy current report to timestamped folder
                            scp -i \$SSH_KEY -o StrictHostKeyChecking=no -r allure-report/* ${params.VPS_USER}@${params.VPS_IP}:${params.DEPLOY_PATH}/${params.PROJECT_NAME}/${buildFolder}/
                            scp -i \$SSH_KEY -o StrictHostKeyChecking=no -r logs ${params.VPS_USER}@${params.VPS_IP}:${params.DEPLOY_PATH}/${params.PROJECT_NAME}/${buildFolder}/

                            # Copy to latest folder (overwrite)
                            scp -i \$SSH_KEY -o StrictHostKeyChecking=no -r allure-report/* ${params.VPS_USER}@${params.VPS_IP}:${params.DEPLOY_PATH}/${params.PROJECT_NAME}/latest/
                            scp -i \$SSH_KEY -o StrictHostKeyChecking=no -r logs ${params.VPS_USER}@${params.VPS_IP}:${params.DEPLOY_PATH}/${params.PROJECT_NAME}/latest/
                        """
                    }
                }
            }
        }
        
        stage('Generate Dashboard') {
            steps {
                build job: 'playwright-dashboard-templates', parameters: [
                    string(name: 'VPS_IP', value: params.VPS_IP),
                    string(name: 'VPS_USER', value: params.VPS_USER),
                    string(name: 'DEPLOY_PATH', value: params.DEPLOY_PATH)
                ], wait: true
                
                withCredentials([sshUserPrivateKey(credentialsId: 'hostinger-ssh-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                    sh """
                        # Copy single project template to project folder
                        ssh -i \$SSH_KEY -o StrictHostKeyChecking=no ${params.VPS_USER}@${params.VPS_IP} "cp ${params.DEPLOY_PATH}/index-template.html ${params.DEPLOY_PATH}/${params.PROJECT_NAME}/"
                        ssh -i \$SSH_KEY -o StrictHostKeyChecking=no ${params.VPS_USER}@${params.VPS_IP} "cp ${params.DEPLOY_PATH}/generate-index.sh ${params.DEPLOY_PATH}/${params.PROJECT_NAME}/"
                        
                        # Generate project-specific index
                        ssh -i \$SSH_KEY -o StrictHostKeyChecking=no ${params.VPS_USER}@${params.VPS_IP} "cd ${params.DEPLOY_PATH}/${params.PROJECT_NAME} && chmod +x generate-index.sh && ./generate-index.sh ${BUILD_NUMBER} ."
                        
                        # Generate multi-project dashboard
                        ssh -i \$SSH_KEY -o StrictHostKeyChecking=no ${params.VPS_USER}@${params.VPS_IP} "${params.DEPLOY_PATH}/generate-multi-project-index.sh ${params.DEPLOY_PATH}"
                    """
                }
            }
        }
    }
    
    post {
        always {
            archiveArtifacts artifacts: 'logs/**', allowEmptyArchive: true
        }
    }
}