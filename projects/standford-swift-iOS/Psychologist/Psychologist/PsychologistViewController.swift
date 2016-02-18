//
//  ViewController.swift
//  Psychologist
//
//  Created by Ahmed Ghalab on 2/17/16.
//  Copyright © 2016 Codivity, LLC. All rights reserved.
//

import UIKit

class PsychologistViewController: UIViewController {

    
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        var destinationVC = segue.destinationViewController as UIViewController
        
        if let navController = destinationVC as? UINavigationController {
            destinationVC = navController.visibleViewController!
        }
            
        if let hvc = destinationVC as? HappinessViewController {
            if let identifier = segue.identifier {
                switch identifier{
                    case "sad":
                        hvc.happinessLevel = 20
                    case "meh":
                        hvc.happinessLevel = 50
                    case "happy":
                        hvc.happinessLevel = 95
                default: break
                }
            }
        }
    }

}

