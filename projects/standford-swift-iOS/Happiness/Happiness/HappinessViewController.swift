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
            faceView.addGestureRecognizer(UIPinchGestureRecognizer(target: faceView, action:"scale:"))
//            faceView.addGestureRecognizer(UIPanGestureRecognizer(target: self, action: "changeHappinessLevel:"))
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
    
    private struct Constants
    {
        static let HappinessGestureScale : CGFloat = 3.0
    }
    
    @IBAction func changeHappinessLevel(gesture: UIPanGestureRecognizer) {

        switch gesture.state
        {
        case .Ended: fallthrough
        case .Changed:
            let translation =  gesture.translationInView(faceView)
            let happinessChange =  -Int( translation.y / Constants.HappinessGestureScale )
            if happinessChange != 0 {
                happinessLevel += happinessChange
                gesture.setTranslation(CGPointZero, inView: faceView)
            }
        default: break
        }
    }
    
    func smilenessForFaceView(sender: FaceView) -> Double?
    {
        return Double(happinessLevel - 50) / 50.0;
    }

}
