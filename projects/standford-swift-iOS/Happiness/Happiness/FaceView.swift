//
//  FaceView.swift
//  Happiness
//
//  Created by Ahmed Ghalab on 2/16/16.
//  Copyright © 2016 Codivity, LLC. All rights reserved.
//

import UIKit

protocol HappinessDataSource : class{
    func smilenessForFaceView(sender: FaceView) -> Double?
}

@IBDesignable
class FaceView: UIView {
    
    @IBInspectable
    var lineWidth : CGFloat = 3 {
        didSet{setNeedsDisplay()}
    }
    
    @IBInspectable
    var lineColor : UIColor = UIColor.blueColor() {
        didSet{setNeedsDisplay()}
    }
    
    @IBInspectable
    var lineScale : CGFloat = 0.9 {
        didSet{setNeedsDisplay()}
    }
    
    weak var dataSource : HappinessDataSource?
    
    func scale(gesture: UIPinchGestureRecognizer){
        if gesture.state == .Changed {
            lineScale *= gesture.scale
            gesture.scale = 1
        }
    }
    
    private struct Scaling {
        static let FaceRadiusToEyeRadiusRatio : CGFloat = 10
        static let FaceRadiusToEyeOffsetRatio : CGFloat = 3
        static let FaceRadiusToEyeSeparartionRatio : CGFloat = 2
        static let FaceRadiusToMouthWidthRatio : CGFloat = 1
        static let FaceRadiusToMouthHeightRatio : CGFloat = 3
        static let FaceRadiusToMouthOffsetRatio : CGFloat = 3
    }
    
    var faceCenter : CGPoint {
        return convertPoint(center, fromView: superview)
    }
    
    var faceRadius: CGFloat{
        return min(bounds.size.height, bounds.size.width) / 2.0 * lineScale
    }

    override func drawRect(rect: CGRect) {
        let path = UIBezierPath(arcCenter: faceCenter, radius: faceRadius, startAngle: 0, endAngle: CGFloat(2 * M_PI), clockwise: true)
        path.lineWidth = lineWidth
        lineColor.set()
        path.stroke()
        
        pathToEye(.Left).stroke()
        pathToEye(.Right).stroke()
        
        let value = dataSource?.smilenessForFaceView(self) ?? 0.0
            pathToSmile(value).stroke()
        
    }
    
    private enum Eye {case Left, Right }

    private func pathToEye(whichEye: Eye) -> UIBezierPath
    {
        let eyeRadius = faceRadius / Scaling.FaceRadiusToEyeRadiusRatio
        let eyeVerticalOffset = faceRadius / Scaling.FaceRadiusToEyeOffsetRatio
        let eyeHorizontalSeparation = faceRadius / Scaling.FaceRadiusToEyeSeparartionRatio
        
        var eyeCenter = faceCenter
        eyeCenter.y -= eyeVerticalOffset
        switch whichEye{
        case .Left: eyeCenter.x -= eyeHorizontalSeparation
        case .Right: eyeCenter.x += eyeHorizontalSeparation
        }
        
        let path = UIBezierPath(arcCenter: eyeCenter, radius: eyeRadius, startAngle: 0, endAngle: CGFloat(2.0 * M_PI), clockwise: true)
        path.lineWidth = lineWidth
        return path
    }
    
    private func pathToSmile (smileFration: Double) -> UIBezierPath{
        let mouthWidth = faceRadius / Scaling.FaceRadiusToMouthWidthRatio
        let mouthHeight = faceRadius / Scaling.FaceRadiusToMouthHeightRatio
        let mouthVerticalOffset = faceRadius / Scaling.FaceRadiusToMouthOffsetRatio

        let smileHeight = CGFloat ( max(min(smileFration, 1), -1) ) * mouthHeight
        
        let start = CGPoint (x: faceCenter.x - mouthWidth / 2.0 , y: faceCenter.y + mouthVerticalOffset)
        let end = CGPoint (x: start.x + mouthWidth, y: start.y)
        let cp1 = CGPoint (x: start.x + mouthWidth/3.0, y: start.y + smileHeight)
        let cp2 = CGPoint (x: end.x - mouthWidth/3.0, y: cp1.y)
        
        let path = UIBezierPath()
        path.moveToPoint(start)
        path.addCurveToPoint(end, controlPoint1: cp1, controlPoint2: cp2)
        path.lineWidth = lineWidth
        return path
    }
    
}
