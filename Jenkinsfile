pipeline {
    agent any
    
    environment {
        VERSION = "${env.BUILD_ID}"
        NEXUS_VERSION = "nexus3"
        NEXUS_PROTOCOL = "http"
        NEXUS_URL = "localhost:8083"
        NEXUS_URL1 = "images.devcenter.uz"
        NEXUS_REPOSITORY = "java-app"
        NEXUS_CREDENTIAL_ID = "NEXUS_CRED"
        SERVER = "185.105.90.64"
    }
    stages {
        stage("SCM lone"){
            // steps {
                
            //     checkout([$class: 'GitSCM', branches: [[name: '*/master']], extensions: [], userRemoteConfigs: [[credentialsId: 'ssh-key-connect', url: 'git@github.com:inabijon/uyer.uz.git']]])
                
            // }
            steps {
                echo "Cloneing the code"
                git url:"https://github.com/inabijon/uyer.uz.git", branch: "master"
            }
          
        }
        
        
       
        stage("build") {
            steps {
                sh "docker build -t my-java-app1 ."
                sh 'docker ps -aqf "name=my-java-app1" | xargs -r docker rm -f'
                sh "docker run -itd -p 8000:8000 --name=my-java-app1 my-java-app1"
            }
        }
        
        
       
    }
}
