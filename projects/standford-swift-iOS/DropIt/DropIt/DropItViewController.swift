//
//  DropItViewController.swift
//  DropIt
//
//  Created by Ahmed Ghalab on 2/29/16.
//  Copyright © 2016 Codivity, LLC. All rights reserved.
//

import UIKit

class DropItViewController: UIViewController {

    @IBOutlet weak var gameView: UIView!
    
    let gravity = UIGravityBehavior()
    
    lazy var animator : UIDynamicAnimator = {
        let lazilyCreatedDynamicAnimator =  UIDynamicAnimator (referenceView: self.gameView)
        return lazilyCreatedDynamicAnimator
    }()
    
    lazy var collider : UICollisionBehavior  = {
        let lazilyCreatedCollider =  UICollisionBehavior()
        lazilyCreatedCollider.translatesReferenceBoundsIntoBoundary = true
        return lazilyCreatedCollider
    }()

    override func viewDidLoad() {
        animator.addBehavior(gravity)
        animator.addBehavior(collider)
    }
    var dropsPerRow = 10
    
    var dropSize : CGSize{
        let borderLength = self.view.frame.size.width / CGFloat(dropsPerRow)
        return CGSizeMake(borderLength, borderLength)
    }
    
    @IBAction func pan(sender: UITapGestureRecognizer) {
        pan()
    }
    
    private func pan()
    {
        var frame =  CGRect(origin: CGPointZero, size: dropSize)
        frame.origin.x = CGFloat.random(dropsPerRow) * dropSize.width
        
        let dropView = UIView(frame: frame)
        dropView.backgroundColor = UIColor.random()
        
        gameView.addSubview(dropView)
        gravity.addItem(dropView)
        collider.addItem(dropView)
    }
    
}

private extension CGFloat
{
    static func random(max: Int) -> CGFloat
    {
        return CGFloat(arc4random() % UInt32(max))
    }
}


private extension UIColor
{
    static func random() -> UIColor
    {
        let number = arc4random() % UInt32(5)
        switch number
        {
            case 0: return UIColor.redColor()
            case 1: return UIColor.greenColor()
            case 2: return UIColor.yellowColor()
            case 3: return UIColor.blackColor()
            case 4: return UIColor.purpleColor()
        default:
            return UIColor.blackColor()
        }
        
    }
}
