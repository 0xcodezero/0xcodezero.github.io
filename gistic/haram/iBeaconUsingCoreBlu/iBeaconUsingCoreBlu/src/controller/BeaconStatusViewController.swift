//
//  BeaconStatusViewController.swift
//  iBeaconUsingCoreBlu
//
//  Created by Ahmed Ghalab on 3/9/16.
//  Copyright © 2016 GIS Technology Innovation Center. All rights reserved.
//

import UIKit
import CoreLocation

class BeaconStatusViewController: UIViewController, CLLocationManagerDelegate
{
    
    let locationManager = CLLocationManager()
    let region = CLBeaconRegion(proximityUUID: NSUUID(UUIDString: "bb1ea592-270e-48f4-89d1-8f8aa9768466")!, identifier: "First Beacon to read")
    let colors = [6: UIColor.redColor(), 5:UIColor.blueColor()]
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        locationManager.delegate = self
        
        if( CLLocationManager.authorizationStatus() != CLAuthorizationStatus.AuthorizedAlways )
        {
            locationManager.requestAlwaysAuthorization()
        }
        
        locationManager.startRangingBeaconsInRegion(region)
    }
    
    
    func locationManager(manager: CLLocationManager, didRangeBeacons beacons: [CLBeacon], inRegion region: CLBeaconRegion) {
        let nearBeacons = beacons.filter{$0.proximity != CLProximity.Unknown}
        if nearBeacons.count > 0 {
            let closestBeacon = nearBeacons[0] as CLBeacon
            self.view.backgroundColor = colors[closestBeacon.minor.integerValue]
        }else
        {
            self.view.backgroundColor = UIColor.whiteColor()
        }
    }
}
