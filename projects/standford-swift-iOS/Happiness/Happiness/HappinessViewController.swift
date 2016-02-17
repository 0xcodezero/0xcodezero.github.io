//
//  HappinessViewController.swift
//  Happiness
//
//  Created by Ahmed Ghalab on 2/16/16.
//  Copyright © 2016 Codivity, LLC. All rights reserved.
//

import UIKit

class HappinessViewController: UIViewController , HappinessDataSource {

    @IBOutlet weak var faceView : FaceView! {
        didSet{
            faceView.dataSource = self
        }
    }
    
    var happinessLevel : Int = 30 {
        didSet{
            happinessLevel = min (max(happinessLevel, 0), 100)
            print("Happiness = \(happinessLevel)")
            updateUI()
        }
    }
    
    private func updateUI()
    {
        faceView.setNeedsDisplay()
    }
    
    func smilenessForFaceView(sender: FaceView) -> Double?
    {
        return Double(happinessLevel - 50) / 50.0;
    }

}
