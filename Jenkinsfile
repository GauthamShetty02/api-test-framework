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
        
        stage('Build Docker Image') {
            steps {
                sh 'docker build -t playwright-framework:latest .'
            }
        }
        
        stage('Cleanup Previous Results') {
            steps {
                sh 'rm -rf allure-results logs allure-report || true'
                sh 'rm -rf .allure || true'
                sh 'mkdir -p allure-results logs'
            }
        }
        
        stage('Run Tests') {
            steps {
                sh 'docker run --rm -v $(pwd)/allure-results:/app/allure-results -v $(pwd)/logs:/app/logs playwright-framework:latest'
            }
        }
        
        stage('Generate Allure Report') {
            steps {
                script {
                    // Clean any existing allure report
                    sh 'rm -rf ${WORKSPACE}/allure-report || true'
                }
                allure([
                    includeProperties: false,
                    jdk: '',
                    properties: [],
                    reportBuildPolicy: 'ALWAYS',
                    results: [[path: 'allure-results']]
                ])
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