//
//  DropItBehavior.swift
//  DropIt
//
//  Created by Ahmed Ghalab on 2/29/16.
//  Copyright © 2016 Codivity, LLC. All rights reserved.
//

import UIKit

class DropItBehavior: UIDynamicBehavior {
    let gravity = UIGravityBehavior()
    
    lazy var collider : UICollisionBehavior  = {
        let lazilyCreatedCollider =  UICollisionBehavior()
        lazilyCreatedCollider.translatesReferenceBoundsIntoBoundary = true
        return lazilyCreatedCollider
    }()
    
    lazy var itemBehavior : UIDynamicItemBehavior  = {
        let lazilyCreatedItemBehavior =  UIDynamicItemBehavior()
        lazilyCreatedItemBehavior.allowsRotation = false
        lazilyCreatedItemBehavior.elasticity = 0.5
        return lazilyCreatedItemBehavior
    }()
    
    override init() {
        super.init()
        addChildBehavior(gravity)
        addChildBehavior(collider)
        addChildBehavior(itemBehavior)
    }
    
    func addDrop(drop: UIView)
    {
        dynamicAnimator?.referenceView?.addSubview(drop)
        gravity.addItem(drop)
        collider.addItem(drop)
        itemBehavior.addItem(drop)
    }
    
    func removeDrop(drop: UIView)
    {
        gravity.removeItem(drop)
        collider.removeItem(drop)
        itemBehavior.removeItem(drop)
        drop.removeFromSuperview()
    }
}
