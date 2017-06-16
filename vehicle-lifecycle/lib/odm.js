/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Store Ruleapps in world state
 * @param {com.ibm.rules.RuleAppUpdated} ruleAppUpdatedTransaction
 * @transaction
 */
function processRuleAppUpdatedTransaction(ruleAppUpdatedTransaction) 
{
    console.log("Receiving RuleAppUpdated transaction " + ruleAppUpdatedTransaction.ruleAppName);
    var factory = getFactory();
    var NS = 'com.ibm.rules';

    var ruleapp = factory.newResource(NS, 'RuleApp', 'RULEAPP_' + ruleAppUpdatedTransaction.transactionId);
    ruleapp.ruleAppName = ruleAppUpdatedTransaction.ruleAppName;
    ruleapp.ruleapp_version = ruleAppUpdatedTransaction.ruleapp_version;
    ruleapp.ruleset_version = ruleAppUpdatedTransaction.ruleset_version;
    ruleapp.archive = ruleAppUpdatedTransaction.archive;

    getAssetRegistry(NS + '.' + 'RuleApp')
      .then(function(reg) {
        	console.log("OK 5");
        	return reg.add(ruleapp);
       });

    var currentVersion;
    var currentVersionRegistry;
    
    console.log("Initialization completed");

    getAssetRegistry(NS + '.' + 'RuleAppCurrentVersion')
      .then(function (registry) 
      {
          currentVersionRegistry = registry;
          return registry.get(ruleapp.ruleAppName)
          .then(function (cv){
            currentVersion = cv;
          }).catch(function (err) {
            console.log("Can't get currentVersion");
            currentVersion = null;
          });
      })
      .then(function () {
          var add = false;
          if (!currentVersion) {
              currentVersion = factory.newResource(NS, 'RuleAppCurrentVersion', ruleapp.ruleAppName);
              add = true;
          }
          currentVersion.ruleapp_version = ruleapp.ruleapp_version;
          currentVersion.ruleset_version = ruleapp.ruleset_version;
          if (add) {
            return currentVersionRegistry.add(currentVersion).catch(function (err) {
              console.log("Faill to add current version");
            });  
          } else {
            return currentVersionRegistry.update(currentVersion).catch(function (err) {
              console.log("Faill to update current version");
            });  
          }
      })
      .then(function () {        
        console.log("Calling out to " + ruleAppUpdatedTransaction.resDeployerURL);
        return post(ruleAppUpdatedTransaction.resDeployerURL, ruleAppUpdatedTransaction)      
          .then(function (result) {
            console.log("Receiving good answer from ODM Decision Service Deployer: " + result.body.response);
            console.log("Full response: " + JSON.stringify(result));
          }).catch(function (error) {
            console.log("Error calling out the decision service deployer");
            console.log(error);
          });
          
      });
}

/**
 * Store Xom in world state
 * @param {com.ibm.rules.XomUpdated} xomUpdatedTransaction
 * @transaction
 */
function processXomUpdatedTransaction(xomUpdatedTransaction) 
{
    console.log("Receiving xomUpdated transaction " + xomUpdatedTransaction.xomName);
    var factory = getFactory();
    var NS = 'com.ibm.rules';

    var xom = factory.newResource(NS, 'Xom', 'XOM_' + xomUpdatedTransaction.transactionId);
    xom.xomName = xomUpdatedTransaction.xomName;
    xom.xom_version = "no version";
    xom.xom = xomUpdatedTransaction.xom;
    xom.libraryName = xomUpdatedTransaction.libraryName;
    xom.library_version = xomUpdatedTransaction.library_version;

    var xomRegistry;
    var failed = false;

    getAssetRegistry(NS + '.' + 'Xom')
      .then(function(reg) {
        xomRegistry = reg;
       }) 
      .then(function () {        
        console.log("Calling out to " + xomUpdatedTransaction.resDeployerURL);
        return post(xomUpdatedTransaction.resDeployerURL, xomUpdatedTransaction)      
          .then(function (result) {
            console.log("Receiving good answer from ODM Decision Service Deployer: " + result.body.response);
            console.log("Full response: " + JSON.stringify(result));
            if (result.body.xom_version != null) {
              xom.xom_version = result.body.xom_version;            
            } else {
              xom.xom_version = "No XOM version returned by ODM deployer";
            }
          }).catch(function (error) {
            failed = true;
            console.log("Error calling out the decision service deployer");
            console.log(error);
          })
          .then(function () {
            if (!failed) {
        	    return xomRegistry.add(xom);
            }
          })
          .catch(function (err) {
            console.log("Error saving XOM " + err);
            console.log(err);
          });          
      });
}
