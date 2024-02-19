# IBM Sterling B2B Integrator Document Service v1.0.0.0
## Introduction
Sterling B2B Integrator offers support for Cloud Object Store (S3, Azure, and Google Cloud) as a document storage option for document payloads through its Document Service.
To find out more, see 

## Chart Details
This sub-chart is deployed by B2BI charts on a container management platform with the following resources
Deployments
* Document Service (DM) with 1 replica by default
Services
* Rest Document service - This service is utilized by B2BI services through a REST client.
* GRPC Document service - This service is utilized by B2BI services through a GRPC client.

## Prerequisites
1. Red Hat OpenShift Container Platform
   Version 4.12.0 or later fixes
   Version 4.13.0 or later fixes

2. Kubernetes version >= 1.25 and <= 1.27

3. Helm version >= 3.12.x

4. Ensure that the docker images for Document Service from IBM Entitled Registry are downloaded and pushed to an image registry accessible to the cluster.

5. Ensure that B2BI must enable the Document Service.

6. Provide external resource artifacts like Key store and trust store files, Using an init container for resources or a persistent volume for resources.
7. When `logs.enableAppLogOnConsole` is `false`, create a persistent volume for application logs with access mode as 'Read Write Many'.
8. Create custom network policies to enable required ingress and egress endpoints for required external services like rest document Service and grpc document Service integration services.
9. Use same B2BI secret to pull the image from a private registry or repository.
10. Create secrets with confidential certificates required by B2BI to DM SSL connectivity. For more detailed information, please check additional guidance tlsSecretName and trustStoreSecretName generate.
11. Configure details of the Cloud Object Store, such as its Name, Region, Endpoint, and other relevant information.
12. Generate the secrets required for establishing connectivity between Document Service(DM) and the Cloud Store, including secrets for the Object Store and proxy server check the Objectstore secretName and Objectstore proxy Password SecretName.

### SecurityContextConstraints Requirements
_WRITER NOTES:  Replace the Predefined SCC Name and SCC Definition with the required values in your chart.  See [ https://ibm.biz/icppbk-psp] for help._

This chart requires a SecurityContextConstraints to be bound to the target namespace prior to installation. To meet this requirement there may be cluster scoped as well as namespace scoped pre and post actions that need to occur.

The predefined OpenShift SecurityContextConstraints name: `anyuid` has been verified for this chart, if your target namespace is bound to this SecurityContextConstraints resource you can proceed to install the chart.

This chart also defines a custom SecurityContextConstraints which can be used to finely control the permissions/capabilities needed to deploy this chart. You can enable this custom SecurityContextConstraints resource using the supplied instructions/scripts in the pak_extension pre-install directory.

 * Predefined SecurityContextConstraints name: [`ibm-restricted-scc`](https://ibm.biz/cpkspec-scc)

- From the user interface or command line, you can copy and paste the following snippets to create and enable the below custom SCC based on IBM restricted SCC.

  - Custom SecurityContextConstraints definition:

    ```
    apiVersion: security.openshift.io/v1
    kind: SecurityContextConstraints
    metadata: 
      name: ibm-dm-scc
      labels:
       app: "ibm-dm-scc"
    allowHostDirVolumePlugin: false
    allowHostIPC: false
    allowHostNetwork: false
    allowHostPID: false
    allowHostPorts: false
    privileged: false
    allowPrivilegeEscalation: false
    allowPrivilegedContainer: false
    allowedCapabilities: 
    allowedFlexVolumes: []
    allowedUnsafeSysctls: []
    defaultAddCapabilities: []
    defaultAllowPrivilegeEscalation: false
    forbiddenSysctls:
      - "*"
    fsGroup:
      type: MustRunAs
      ranges:
      - min: 1
        max: 4294967294
    readOnlyRootFilesystem: false
    requiredDropCapabilities:
    - MKNOD
    - AUDIT_WRITE
    - KILL
    - NET_BIND_SERVICE
    - NET_RAW
    - FOWNER
    - FSETID
    - SYS_CHROOT
    - SETFCAP
    - SETPCAP
    - CHOWN
    - SETGID
    - SETUID
    - DAC_OVERRIDE
    runAsUser:
      type: MustRunAsRange
    # This can be customized for your host machine
    seLinuxContext:
      type: MustRunAs
    # seLinuxOptions:
    #   level:
    #   user:
    #   role:
    #   type:
    supplementalGroups:
      type: MustRunAs
      ranges:
      - min: 1
        max: 4294967294
    # This can be customized for your host machine
    volumes:
    - configMap
    - downwardAPI
    - emptyDir
    - persistentVolumeClaim
    - projected
    - secret
    - nfs
    priority: 0
    ```

    - Custom Role for the custom SecurityContextConstraints:
    
    ```
    apiVersion: rbac.authorization.k8s.io/v1
	  kind: Role
	  metadata:
     name: "ibm-dm-scc"
     labels:
      app: "ibm-dm-scc" 
	  rules:
	  - apiGroups:
  	  - security.openshift.io
  	  resourceNames:
      - "ibm-dm-scc"
      resources:
      - securitycontextconstraints
      verbs:
      - use
    
    ```

    - Custom Role binding for the custom SecurityContextConstraints:

    ```
    apiVersion: rbac.authorization.k8s.io/v1
    kind: RoleBinding
    metadata:
      name: "ibm-dm-scc"
      labels:
        app: "ibm-dm-scc"
    roleRef:
      apiGroup: rbac.authorization.k8s.io
      kind: Role
      name: "ibm-dm-scc"
    subjects:
    - apiGroup: rbac.authorization.k8s.io
      kind: Group
      name: system:serviceaccounts
      namespace: {{ NAMESPACE }}
    ```

## Resources Required
The following table describes the default usage and limits per pod

Pod                                       | Memory Requested  | Memory Limit | CPU Requested | CPU Limit
------------------------------------------| ------------------|--------------| --------------|----------
Document Service (DM) pod                 |       4 Gi        |     8 Gi     |      1000m        |  2000m

## Pre-install steps

Before installing the chart to your cluster, the cluster admin must perform the following pre-install steps.

* Create a namespace
* Create a ServiceAccount
    ```
    apiVersion: v1
    kind: ServiceAccount
    metadata: 
      name: {{ sa_name }}-nginxref-nginx
    imagePullSecrets:
    - name: sa-{{ NAMESPACE }}
    ```

If you use the custom security configuration provided here, you must specify messagesight-sa as the service account for your charts.


## Installing the Chart
* Verify B2Bi helm charts must have Document Service sub charts present into the b2bi charts location(ibm-document-service-prod) for installation of Document Service.
* Prepare a custom values.yaml file based on the configuration section.
* Provide a Bucket name configuration of Cloud storage which must be used by Document Service for storing documents.  
* It's sub-charts, so it will install  with B2BI charts installation.


> **Tip**: List all releases using `helm list`

* Generally teams have subsections for : 
   * Verifying the Chart
   * Uninstalling the Chart

### Verifying the Chart
See the instruction (from NOTES.txt within chart) after the helm installation completes for chart verification. The instruction can also be viewed by running the command: helm status my-release --tls.

### Uninstalling the Chart

To uninstall/delete the `my-release` deployment:

```bash
$ helm delete my-release --purge --tls
```

The command removes all the Kubernetes components associated with the chart and deletes the release.  If a delete can result in orphaned components include instructions with additional commands required for clean-up.  

For example :

When deleting a release with stateful sets the associated persistent volume will need to be deleted.  
Do the following after deleting the chart release to clean up orphaned Persistent Volumes.

```console
$ kubectl delete pvc -l release=my-release
```

### Cleanup any pre-reqs that were created
If cleanup scripts were included in the pak_extensions/post-delete directory; run them to cleanup namespace and cluster scoped resources when appropriate.

## Configuration

### The following table lists the configurable parameters for the DM sub-chart

| Parameter                                                                  | Description                                                                                                                                                                  | Default                                                 |
|----------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------|
| `license`                                                                  | Accept DM/SFG license                                                                                                                                                        | `fasle`                                                 |
| `replicaCount`                                                             | Number of deployment replicas                                                                                                                                                | `1`                                                     |
| `image.repository`                                                         | `PRODUCTNAME` image repository                                                                                                                                               | `nginx`                                                 |
| `image.pullPolicy`                                                         | Image pull policy                                                                                                                                                            | `Always` if `imageTag` is `latest`, else `IfNotPresent` |
| `image.tag`                                                                | `PRODUCTNAME` image tag                                                                                                                                                      | `stable`                                                |
| `service.type`                                                             | k8s service type exposing ports, e.g. `NodePort`                                                                                                                             | `ClusterIP`                                             |
| `arch.amd64`                                                               | Specify weight to be used for scheduling for architecture amd64                                                                                                              | 2 - No Preference                                       |
| `arch.ppc64le`                                                             | Specify weight to be used for scheduling for architecture ppc64le                                                                                                            | 2 - No Preference                                       |
| `arch.s390x`                                                               | Specify weight to be used for scheduling for architecture s390x                                                                                                              | 2 - No Preference                                       |
| `serviceAccount.name`                                                      | Existing service account name                                                                                                                                                | `default`                                               |
| `persistence.enabled`                                                      | Enable storage access to persistent volumes                                                                                                                                  | `true`                                                  |
| `persistence.useDynamicProvisioning`                                       | Enable dynamic provisioning of persistent volumes                                                                                                                            | `false`                                                 |
| `appLogsPVC.storageClassName`                                              | Logs persistent volume storage class name                                                                                                                                    |                                                         |
| `appLogsPVC.selector.label`                                                | Logs persistent volume selector label                                                                                                                                        | `intent`                                                |
| `appLogsPVC.selector.value`                            
                    | Logs persistent volume selector value                                                                                                                                        | `logs`                                                  |
| `appLogsPVC.accessMode`                                                    | Logs persistent volume access mode                                                                                                                                           | `ReadWriteMany`                                         |
| `appLogsPVC.size`                                                          | Logs persistent volume storage size                                                                                                                                          | `500 Mi`                                                |
| `appLogsPVC.preDefinedLogsPVCName`                                         | Predefined logs persistent volume name                                                                                                                                       |                                                         |
| `extraPVCs`                                                                | Extra volume claims shared across all deployments                                                                                                                            |                                                         |
| `logs.enableAppLogOnConsole`                                               | Enable application logs redirection to pod console                                                                                                                           | true                                                    |
| `security.supplementalGroups`                                              | Supplemental group id to access the persistent volume                                                                                                                        | 0                                                       |
| `security.fsGroup`                                                         | File system group id to access the persistent volume                                                                                                                         | 0                                                       |
| `security.runAsUser`                                                       | The User ID that needs to be run as by all containers                                                                                                                        |                                                         |
| `security.runAsGroup`                                                      | The Group ID that needs to be run as by all containers                                                                                                                       |                                                         |
| `livenessProbe.initialDelaySeconds`                                        | Livenessprobe initial delay in seconds                                                                                                                                       | 60                                                      |
| `livenessProbe.timeoutSeconds`                                             | Livenessprobe timeout in seconds                                                                                                                                             | 30                                                      |
| `livenessProbe.periodSeconds`                                              | Livenessprobe interval in seconds                                                                                                                                            | 60                                                      |
| `readinessProbe.initialDelaySeconds`                                       | ReadinessProbe initial delay in seconds                                                                                                                                      | 60                                                      |
| `readinessProbe.timeoutSeconds`                                            | ReadinessProbe timeout in seconds                                                                                                                                            | 5                                                       |
| `readinessProbe.periodSeconds`                                             | ReadinessProbe interval in seconds                                                                                                                                           | 60                                                      |
| `service.type`                                                             | Service type                                                                                                                                                                 | ClusterIP                                               |
| `service.externalport`                                                     | Service external port                                                                                                                                                        | 80                                                      |
| `service.externalPort`                                                     | External TCP Port for this service                                                                                                                                           | `80`                                                    |
| `ingress.enabled`                                                          | Ingress enabled                                                                                                                                                              | `false`                                                 |
| `ingress.hosts`                                                            | Host to route requests based on                                                                                                                                              | `false`                                                 |
| `ingress.annotations`                                                      | Meta data to drive ingress class used, etc.                                                                                                                                  | `nil`                                                   |
| `ingress.tls`                                                              | TLS secret to secure channel from client / host                                                                                                                              | `nil`                                                   |
| `affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution`     | k8s PodSpec.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution. Refer section "Affinity".                                                                           |                                                         |
| `affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution`    | k8s PodSpec.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution. Refer section "Affinity".                                                                          |                                                         |
| `affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution`      | k8s PodSpec.podAffinity.requiredDuringSchedulingIgnoredDuringExecution. Refer section "Affinity".                                                                            |                                                         |
| `affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution`     | k8s PodSpec.podAffinity.preferredDuringSchedulingIgnoredDuringExecution. Refer section "Affinity".                                                                           |                                                         |
| `affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution`  | k8s PodSpec.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution. Refer section "Affinity".                                                                        |                                                         |
| `affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution` | k8s PodSpec.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution. Refer section "Affinity".                                                                       |                                                         |
| `topologySpreadConstraints`                                                | Topology spread constraints to control how Pods are spread across your cluster among failure-domains such as regions, zones, nodes, and other user-defined topology domains. |                                                         |
| `tolerations`                                                              | Tolerations to pods, and allow (but do not require) the pods to schedule onto nodes with matching taints                                                                     |                                                         |
| `autoscaling.enabled`                                                      | Enable autoscaling                                                                                                                                                           | false                                                   |
| `autoscaling.minReplicas`                                                  | Minimum replicas for autoscaling                                                                                                                                             | 1                                                       |
| `autoscaling.maxReplicas`                                                  | Maximum replicas for autoscaling                                                                                                                                             | 2                                                       |
| `autoscaling.targetCPUUtilizationPercentage`                               | Target CPU utilization                                                                                                                                                       | 60                                                      |
`env.tz`                                       | Timezone for application runtime                                     | `UTC`
`env.extraEnvs`                                | Provide extra global environment variables                           |
| `resources.requests.memory`                                                | Memory resource requests                                                                                                                                                     | `128Mi`                                                 |
| `resources.requests.cpu`                                                   | CPU resource requests                                                                                                                                                        | `100m'                                                  |
| `resources.limits.memory`                                                  | Memory resource limits                                                                                                                                                       | `128Mi`                                                 |
| `resources.limits.cpu`                                                     | CPU resource limits                                                                                                                                                          | `100m`                                                  |
| `application.server.port`                                                  | Specify the desired port number for document microservice application server                                                                                                 | 8043                                                    |
| `application.server.jetty.acceptors`                                       | Specifies the number of acceptor threads that Jetty should use                                                                                                               | 10                                                      |
| `application.server.jetty.maxHttpPostSize`                                 | Specifies the maximum allowed size for an HTTP POST request body that can be processed by the Jetty server                                                                   | 0                                                       |
| `application.server.jetty.selectors`                                       | Specifies the number of selector threads that Jetty should use                                                                                                               | 10                                                      |
| `application.server.ssl.enabled`                                           | Use SSL/TLS protocols to secure the communication between b2bi and the document microservice                                                                                 | true                                                    |
| `application.server.ssl.tlsSecretName`                                     | The application server can access the required certificate and private key information from the secret                                                                       |                                                         |
| `application.server.ssl.trustStoreType`                                    | Specify the type of trust store being used                                                                                                                                   | PKCS12                                                  |
| `application.server.ssl.trustStoreSecretName`                              | Specify the name of the secret that holds the trust store file associated with the application server                                                                        |                                                         |
| `application.server.ssl.clientAuth`                                        | Specify client authentication is required by the application server for SSL/TLS connections                                                                                  | want                                                    |
| `application.server.ssl.ciphers`                                           | Cipher suites that the server is willing to use during SSL/TLS negotiation                                                                                                   |                                                         |
| `application.logging.level`                                                | Control the verbosity and detail of log messages generated by the application                                                                                                | ERROR                                                   |
| `application.logging.rolloverSize`                                         | Specify this threshold size for log file rotation                                                                                                                            | 10MB                                                    |
| `application.logging.numberOfFiles`                                        | Specify this maximum number of log files to retain                                                                                                                           | 20                                                      |
| `application.spring.servlet.multipartMaxRequestSize`                       | Specify limit the size of the request payload                                                                                                                                | 1MB                                                     |
| `application.spring.servlet.multipartMaxFileSize`                          | Specify the maximum allowed size for an individual file within a multipart/form-data request                                                                                 | 1MB                                                     |
| `application.jvmOptions`                                                   | Value containing one or more JVM options, separated by spaces                                                                                                                |                                                         |
| `objectstore.name`                                                         | Name of the object store                                                                                                                                                     | IBM Cloud                                               |
| 
| `objectstore.endpoint`                                                     | Endpoint of the cloud provider                                                                                                                                               | https://s3.jp-tok.cloud-object-storage.appdomain.cloud/ |
| `objectstore.port`                                                         | Port number which is using by cloud provider connection                                                                                                                      | 1                                                       |
| `objectstore.namespace`                                                    | Interact with objects specifically within that namespace                                                                                                                     | man-test-dm                                             |
| `objectstore.region`                                                       | Specify the region that corresponds to Object Store                                                                                                                          | jp-tok                                                  |
| `objectstore.accountName`                                                  | Account name associated with the object store                                                                                                                                |                                                         |
| `objectstore.secretName`                                                   | Holds the Access key and Secret key required to connect to the Object Store account                                                                                          |                                                         |
| `objectstore.filePrefix`                                                   | specify a prefix or extension to be appended to the file name when uploading or storing objects                                                                              | doc                                                     |
| `objectstore.fileSuffix`                                                   | Specify a suffix or extension to be appended to the file name when uploading or storing objects                                                                              | files                                                   |
| `objectstore.filePartSize`                                                 | Specify the size of these individual parts during file upload or download operations in an object store                                                                      | 104857600                                               |
| `objectstore.partBufferSize`                                               | Specify size of the buffer used for uploading or downloading parts of an object in an object store                                                                           | 10240                                                   |
| `objectstore.serverSideEncryption`                                         | Indicates whether server-side encryption is enabled for an object store                                                                                                      | false                                                   |
| `objectstore.useKeysFromSecrets`                                           | Flag determines if the Object Store authentication is based on the objectstore.secretName or other methods like IAM roles or environment variables.                          | true                                                    |
| `objectstore.sslEnabled`                                                   | Indicates that SSL or TLS encryption is enabled for communication with the object store                                                                                      | true                                                    |
| `objectstore.proxyRequired`                                                | Specify whether a proxy server is necessary for accessing the object store                                                                                                   | false                                                   |
| `objectstore.proxyHost`                                                    | Specifies the hostname or IP address of the proxy server to be used when accessing an object store                                                                           |                                                         |
| `objectstore.proxyPort`                                                    | Specifies the port number to be used for connecting to a proxy server when accessing an object store                                                                         | 0                                                       |
| `objectstore.proxyCredentialRequired`                                      | Specify whether credentials are necessary to authenticate with the proxy server                                                                                              | false                                                   |
| `objectstore.proxyUsername`                                                | Specify username associated with the proxy server for authentication purposes                                                                                                |                                                         |
| `objectstore.proxyPasswordSecretName`                                      | Specify password associated with the proxy server for authentication purposes                                                                                                |                                                         |
| `objectstore.poolSizeTransferMgr`                                          | Specifies the maximum number of concurrent transfers allowed in the transfer manager                                                                                         | 150                                                     |
| `objectstore.connectionTimeout`                                            | Specifies the maximum time allowed for establishing a connection with an object store                                                                                        | 600                                                     |
| `objectstore.readTimeout`                                                  | Specifies the maximum time allowed for reading data from an object store                                                                                                     | 600                                                     |
| `objectstore.threadPoolType`                                                                           | Specify type  executor service thread pool to be used for gRPC                                                                                                               | fixed                                                        |
| `objectstore.poolSizeGrpc`                                                                                                       | Specify the number of threads in the thread pool used by the gRPC                                                                                                            | 50                                                             |
| `objectstore.bufferSizeGrpc`                                                                                                       | Specify size of the buffer used for data transfer by the gRPC                                                                                                           |    65536                                                          |
| `dashboard.enabled`                                                        | Enable automatic load of grafana dashboard                                                                                                                                   | `true`                                                  |


A subset of the above parameters map to the env variables defined in [(PRODUCTNAME)](PRODUCTDOCKERURL). For more information please refer to the [(PRODUCTNAME)](PRODUCTDOCKERURL) image documentation.

Specify each parameter using the `--set key=value[,key=value]` argument to `helm install`.

Alternatively, a YAML file that specifies the values for the parameters can be provided while installing the chart. For example,

> **Tip**: You can use the default values.yaml


## Limitations
* Deployment limits - you can deploy more than once, you need to deploy into different namespace
* Document Service sub-chart will be deployed by B2BI charts. 
* The sub-charts of Document Service do not currently offer any configuration options for encrypting and decrypting data in the cloud storage during the document storage process.

## Documentation
* Can have as many supporting links as necessary for this specific workload however don't overload the consumer with unnecessary information.
* Can be links to special procedures in the knowledge center.

## tlsSecretName and trustStoreSecretName generate
### self-signed user generated certificate
1. Generate a self-signed cert-key pair using the below command.
   openssl req -x509 -nodes -sha256 -subj "/OU=B2B/O=Precisely/CN=localhost/L=Blr/ST=KA/C=IN" -days 3650 -newkey rsa:2048 -keyout tlsdm.key -out tlsdm.crt
2. Add the certificate generated by the above command (tls.crt) to the configured document service truststore:
   keytool -keystore documentsvc_truststore.p12 -alias service -noprompt -storetype PKCS12 -storepass password -import -file tlsdm.crt
3. Add the above truststore to the truststore secret for the document microservice or create new one using below command:
   oc create secret generic truststore-secret-b2bidm-tls --from-file=truststore= documentsvc_truststore.p12 --from-literal=truststore-password=password
4. Create a TLS secret from the cert and key pair created in step 1 :
   oc create secret tls b2bdmtlssecret --key=tlsdm.key --cert=tlsdm.crt -n <namespace>
5. set the secret (b2bdmtlssecret) created in step 4 in your B2BI values.yaml under ASI/AC/API > internalAccess and DM value.yml , server.ssl.tlsSecretName.

### auto generated certificate
* `application.server.ssl.enabled`  = true, Certificate (keystore and truststore) will generate automatically.

#### Objectstore secretName
* To create the secret name in OCP, which holds the access and secret keys for the object store, use the following command:
  
  `oc create secret generic object-secret-dm --from-literal=access_key="DUMMYACCESSKEY" --from-literal=secret_key="DUMMYSECRETKEY"`
#### Objectstore proxy Password SecretName
* To create a secret name for the proxy password that needs to be added in OCP, use the following command:
  
  `oc create secret generic proxypasswdsecret --from-literal=proxy_password="DUMMY_PROXY_PASSWORD"`
> **Tip**: replace "DUMMYACCESSKEY", "DUMMYSECRETKEY", and "DUMMY_PROXY_PASSWORD" with the actual values you want to use for the access key, secret key, and proxy password, respectively