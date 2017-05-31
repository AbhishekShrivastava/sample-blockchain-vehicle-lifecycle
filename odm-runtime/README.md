
To clean up your Docker environment
docker ps -aq | xargs docker rm -f
docker images -aq | xargs docker rmi -f

First download res artifact:
mvn clean install

To create a Docker image from the dockerfile in this directory:
docker-compose build

To run the docker image:
docker-compose run


To Generate the sample payload : 
http://localhost:9060/DecisionService/rest/vehicule/1.0/vehicule/1.0/json?trace=false

To invoke the a sample payload with curl : 
curl -H "Content-Type: application/json" -X POST -d @samplepayload.json http://localhost:9060/DecisionService/rest/vehicule/1.0/vehicule/1.0/


Deploy Fabric 1.0 alpha + 0.7.3 Composer: 
- run the following script to start Fabric & Composer: 
  curl -sSL http://hyperledger.github.io/composer/install-hlfv1.sh | bash
- run the following command to add the odm-runtime: 
  docker-compose run

  TODO TO BE Modified
- import and deploy http-post-network@0.0.1.bna from Composer UI
- play with it
        in 'Test' section of Composer Playground, create an asset with assetID: "a1" and value: "10"
        Submit a 'PostTransaction' with assetId: "a1", a: "3", b: "4"
        Check the value in the Asset, it should now be "Count is 7" => 7 has been calculated by the sample-rest-service

Code snippet to call a REST service: 
/**
 * Handle a POST transaction, calling OpenWhisk
 * @param {org.acme.sample.PostTransaction} postTransaction - the transaction to be processed
 * @transaction
 */
function handlePost(postTransaction) {

  var url = 'http://sample-rest-service:1880/compute';

  return post( url, postTransaction)
      .then(function (result) {
        // alert(JSON.stringify(result));
        postTransaction.asset.value = 'Count is ' + result.body.sum;
        return getAssetRegistry('org.acme.sample.SampleAsset')
          .then(function (assetRegistry) {
            return assetRegistry.update(postTransaction.asset);
          })
          .then(function (assetRegistry) {
            return "Asset updated with value " + result.body.sum;
          });
      });
}
