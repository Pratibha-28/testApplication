# Simple NodeJS Web Application Connecting With MySQL DB And Vault

## Description

This application connects to a database, reads data from MySQL database, and returns this data upon HTTP request.

In minikube, It reads MySQL database credentials from vault. 

## Below are the steps for deploying this web application on minikube along with the required dependancies.


### `System Prerequisites`
Below tools setup should be available.
- Minikube
- Kubectl CLI
- Helm

### `Deployment Instructions`

```
git clone https://github.com/Pratibha-28/testApplication.git
```

**1. Deploy common-secret**
   - Create kubernetes secret which will pull docker images from `https://hub.docker.com/` registry.
   - ``` cd testApplication/setup/helm/common-secret/templates/ ```
   - Update `secret.yml` for `dockercfg`. Below steps to generate the `dockercfg` with your `dockerhub` registry login.
      - base64 encode the below given json format and paste output string infornt of `dockercfg` in `secret.yml` file
        ```
        {"registry.hub.docker.com":{"username":"USERNAME","password":"PASSWORD","email":"EMAILID","auth":"auth FROM .docker/config"}}
        ```
      - Online base64 encode - https://www.base64encode.org/
    - ``` cd ../.. ```
    - ``` helm install common-secret --name=common-secret ```

     **NOTE: This step can be skipped if secret is alreay available on minikube.**
    
**2. Deploy MySQL** 
  
   - ``` cd testApplication/setup/helm/ ```
   - ``` helm install mysql --name=mysql ```
   - ``` helm status mysql ```

   **NOTES:** 
     - This docker image is customized for initial db setup. `MySQL 5.7` base is used.
     - `MySQL 8.0` uses a new default authentication plugin - `caching_sha2_password` - whereas MySQL 5.7 used a different one - `mysql_native_password`. Currently, the community Node.js drivers for MySQL don't support compatible client-side authentication mechanisms for the new server plugin.

**3. Deploy Vault**
   - ``` cd testApplication/setup/helm/ ```
   - ``` helm repo add hashicorp https://helm.releases.hashicorp.com ```
   - ``` helm install hashicorp/vault --values vault/helm-vault-values.yml --name=vault ```
   - ``` helm status vault ```

   ### `Steps For Vault Initialization And Stroring Credentials`
      
   - To check the vault status  
     ``` kubectl exec vault-0 -- vault status ```
         
   - Initialize and unseal Vault  
     ``` kubectl exec vault-0 -- vault operator init -key-shares=1 -key-threshold=1 -format=json > cluster-keys.json ```

   - Export below environment variable  
     ``` VAULT_UNSEAL_KEY="copied unseal_keys_b64 from cluster-keys.json file" ```

   - Unseal the vault using key  
     ``` kubectl exec vault-0 -- vault operator unseal $VAULT_UNSEAL_KEY ```

   - Check vault-0 pod is running  
     ``` kubectl get pods ```

   - Set a secret in Vault (used power shell on Windows system for `pod exec`)  
     ```	kubectl exec -it vault-0 -- /bin/sh ```  
     
   - Vault login in vault-0 pod (use root_token from cluster-keys.json file)  
     ``` vault login  ```
   
   - Enable kv-v2 secrets at the path secret.  
     ``` vault secrets enable -path=secret kv-v2 ```  
     
   - Insert Mysql db creds in vault 
     ``` 
     vault kv put secret/mysql/rootconfig MYSQL_ROOT_PASSWORD="rootpassword"  
     vault kv put secret/mysql/config MYSQL_USER="user" MYSQL_PASSWORD="password"  
     vault kv get secret/mysql/rootconfig  
     vault kv get secret/mysql/config  
     ```  
     
   - Configure Kubernetes authentication so `webapp` can fetch credentials from `vault`  
     ```
     kubectl exec -it vault-0 -- /bin/sh 
     
     vault auth enable kubernetes  
     
     vault write auth/kubernetes/config \
        token_reviewer_jwt="$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)" \
        kubernetes_host="https://$KUBERNETES_PORT_443_TCP_ADDR:443" \
        kubernetes_ca_cert=@/var/run/secrets/kubernetes.io/serviceaccount/ca.crt

     vault policy write mysqlrootconf - <<EOF
     path "secret/data/mysql/rootconfig" {
     capabilities = ["read"]
     }
     EOF

     vault policy write mysqlconf - <<EOF
     path "secret/data/mysql/config" {
     capabilities = ["read"]
     }
     EOF

     vault write auth/kubernetes/role/web-app \
        bound_service_account_names=web-app \
        bound_service_account_namespaces=default \
        policies=mysqlrootconf \
        ttl=90h
        
     vault write auth/kubernetes/role/web-app \
        bound_service_account_names=web-app \
        bound_service_account_namespaces=default \
        policies=mysqlconf \
        ttl=90h
     ```

**4. Deploy Web Application** 
  
   - ``` 
     cd testApplication/setup/helm/
     helm install webapp --name=webapp
     helm status webapp
     ```
**5. Access Web Application In Browser Of Local System** 

   - ``` 
     kubectl port-forward WEBAPP-POD-NAME 3000:3000
     #To check the webapp pod logs
     kubectl logs -f deployment/webapp --all-containers=true --since=10m
     ```
   - Web application endpoint to get the data from MySQL db.  
     http://localhost:3000/message

![alt text](https://github.com/Pratibha-28/testApplication/blob/main/tempsnip.png?raw=true)

## References  
- https://learn.hashicorp.com/tutorials/vault/kubernetes-minikube
- https://www.vaultproject.io/docs/platform/k8s/injector/examples
