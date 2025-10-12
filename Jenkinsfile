pipeline {
    agent any

    parameters {
        choice(
            name: 'REGISTRY_OPTION',
            choices: ['Kshitiz Container (100.94.112.9:5000)', 'Naman Container (100.121.35.107:5000)'],
            description: 'Select which registry to push the image to'
        )
        choice(
            name: 'DEPLOY_HOST',
            choices: ['100.94.112.9', '100.121.35.107', 'both'],
            description: 'Select where to deploy the container'
        )
    }

    environment {
        IMAGE_NAME     = "halfskirmish-expenses"
        CONTAINER_NAME = "halfskirmish-expenses"
        NETWORK        = "app"
    }

    stages {
        stage('Set Registry') {
            steps {
                script {
                    if (params.REGISTRY_OPTION == 'Kshitiz Container (100.94.112.9:5000)') {
                        env.REGISTRY = "100.94.112.9:5000"
                    } else {
                        env.REGISTRY = "100.121.35.107:5000"
                    }
                }
            }
        }

        stage('Prepare Environment Files') {
            steps {
                script {
                    // Remove all .env.* files (like .env.local, .env.dev, etc.)
                    sh "rm -f .env.*"

                    // Ensure only .env is used
                    if (!fileExists('.env')) {
                        error(".env file not found in the project directory!")
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh """
                        docker build -t \$IMAGE_NAME .
                        docker tag \$IMAGE_NAME \$REGISTRY/\$IMAGE_NAME
                    """
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                sh "docker push \$REGISTRY/\$IMAGE_NAME"
            }
        }

        stage('Deploy Container') {
            steps {
                script {
                    def deployHosts = []
                    if (params.DEPLOY_HOST == 'both') {
                        deployHosts = ['100.94.112.9', '100.121.35.107']
                    } else {
                        deployHosts = [params.DEPLOY_HOST]
                    }

                    for (host in deployHosts) {
                        sh """
                            docker -H tcp://$host:2375 pull $REGISTRY/$IMAGE_NAME
                            docker -H tcp://$host:2375 stop $CONTAINER_NAME || true
                            docker -H tcp://$host:2375 rm $CONTAINER_NAME || true
                            docker -H tcp://$host:2375 run -d --name $CONTAINER_NAME --network $NETWORK $REGISTRY/$IMAGE_NAME
                        """
                    }
                }
            }
        }
    }
}
