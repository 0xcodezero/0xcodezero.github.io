//
//  ViewController.swift
//  Autolayout
//
//  Created by Ahmed Ghalab on 2/28/16.
//  Copyright © 2016 Codivity, LLC. All rights reserved.
//

import UIKit

class ViewController: UIViewController
{
    
    @IBOutlet weak var passwordLabel: UILabel!
    @IBOutlet weak var passwordField: UITextField!
    @IBOutlet weak var usernameField: UITextField!
    
    var secure: Bool = false {
        didSet{
            updateUI()
        }
    }
    @IBAction func login(sender: UIButton) {
    }
    
    @IBAction func changeSecurity(sender: UIButton) {
        secure = !secure
    }
    
    private func updateUI()
    {
        passwordField.secureTextEntry = secure
        passwordLabel.text = secure ? "Secured Password:" : "Password:"
    }
    
}

