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
 * Transfer a vehicle to another private owner
 * @param {org.vda.PrivateVehicleTransfer} privateVehicleTransfer - the PrivateVehicleTransfer transaction
 * @transaction
 */
function privateVehicleTransfer(privateVehicleTransfer) {
    console.log('privateVehicleTransfer');

    var currentParticipant = getCurrentParticipant();
    

    var NS_M = 'org.acme.vehicle.lifecycle.manufacturer';
    var NS = 'org.acme.vehicle.lifecycle';
    var NS_D = 'org.vda';
    var NS_B = 'composer.base';
    var factory = getFactory();

    var seller = privateVehicleTransfer.seller;
    var buyer = privateVehicleTransfer.buyer;
    var vehicle = privateVehicleTransfer.vehicle;

    // this is where we're calling out to a Decision Service to determine of the transaction is suspicious or not
    // The Decision Service returns a 'status' and a 'message'. 'status' could be ACCEPTED, REJECTED, ACCEPTED_WITH_SUSPICION. 
    // If REJECTED, the transaction should aborted with the 'message' indicating why. If ACCEPTED_WITH_SUSPICION, the 'message' 
    // should be assigned to the Vehicle.suspiciousMessage field
    // The Decision Service receives all the data about the current transaction: buyer, seller and the vehicle

    // TODO call the Decision Service
    var url = 'http://sample-rest-service:1880/compute';

    post( url, privateVehicleTransfer)
      .then(function (result) {
        console.log("Receiving answer from REST service: " + JSON.stringify(result));
      });

    //change vehicle owner
    vehicle.owner = buyer;

    //PrivateVehicleTransaction for log
    var vehicleTransferLogEntry = factory.newConcept(NS_D, 'VehicleTransferLogEntry');
    vehicleTransferLogEntry.transactionId = privateVehicleTransfer.transactionId;
    vehicleTransferLogEntry.vehicle = factory.newRelationship(NS_D, 'Vehicle', vehicle.getIdentifier());
    vehicleTransferLogEntry.seller = factory.newRelationship(NS_B, 'Person', seller.getIdentifier());
    vehicleTransferLogEntry.buyer = factory.newRelationship(NS_B, 'Person', buyer.getIdentifier());
    vehicleTransferLogEntry.timestamp = privateVehicleTransfer.timestamp;
    if (!vehicle.logEntries) {
        vehicle.logEntries = [];
    }

    vehicle.logEntries.push(vehicleTransferLogEntry);

    return getAssetRegistry(vehicle.getFullyQualifiedType())
        .then(function(ar) {
            return ar.update(vehicle);
        });
}

/**
 * Scrap a vehicle
 * @param {org.vda.ScrapVehicle} scrapVehicle - the ScrapVehicle transaction
 * @transaction
 */
function scrapVehicle(scrapVehicle) {
    console.log('scrapVehicle');

     var NS_D = 'org.vda';
     var assetRegistry;

     return getAssetRegistry(NS_D + '.Vehicle')
        .then(function(ar) {
            assetRegistry = ar;
            return assetRegistry.get(scrapVehicle.vehicle.getIdentifier());
        })
        .then(function(vehicle){
            vehicle.vehicleStatus = 'SCRAPPED';
            return assetRegistry.update(vehicle);
        });
}