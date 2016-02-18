//
//  DiagnosedHappinessViewController.swift
//  Psychologist
//
//  Created by Ahmed Ghalab on 2/17/16.
//  Copyright © 2016 Codivity, LLC. All rights reserved.
//

import UIKit

class DiagnosedHappinessViewController: HappinessViewController , UIPopoverPresentationControllerDelegate {
    override var happinessLevel: Int{
        didSet{
            diagnosticHistory += [happinessLevel]
        }
    }
    
    private let defaults = NSUserDefaults.standardUserDefaults()
    
    var diagnosticHistory : [Int]{
        get{ return defaults.objectForKey(StoryBoardIndetifiers.HistoryDefaultKey) as? [Int] ?? [] }
        
        set{ defaults.setObject(newValue, forKey: StoryBoardIndetifiers.HistoryDefaultKey) }
    }
    
    private struct StoryBoardIndetifiers
    {
        static let SegueForPopup = "Diagnostic History"
        static let HistoryDefaultKey = "DiagnostedViewController.History"
    }
    
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        if let identifier = segue.identifier {
            switch identifier
            {
            case StoryBoardIndetifiers.SegueForPopup:
                if let tVC = segue.destinationViewController as? TextViewController{
                    if let ppc = tVC.popoverPresentationController{
                        ppc.delegate = self
                    }
                    tVC.text = "\(diagnosticHistory)"
                }
            default:break
            }
        }
    }
    
    func adaptivePresentationStyleForPresentationController(controller: UIPresentationController) -> UIModalPresentationStyle {
        return UIModalPresentationStyle.None
    }
    
}
