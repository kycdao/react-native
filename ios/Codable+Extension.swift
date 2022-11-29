//
//  Codable+Extension.swift
//  kycdao-mobile
//
//  Created by Vekety Robin on 2022. 09. 20..
//

import Foundation
import KycDao

extension Encodable {
    
    func encodeToDictionary() throws -> [String: Any] {
        let encodedObject = try JSONEncoder().encode(self)
        
        guard let dictionary = try JSONSerialization.jsonObject(with: encodedObject, options: .fragmentsAllowed) as? [String: Any]
        else {
            print(self)
            print(try JSONSerialization.jsonObject(with: encodedObject, options: .fragmentsAllowed))
            throw KycDaoError.genericError
        }
        
        return dictionary
    }
    
    func encodeToArray() throws -> [Any] {
        let encodedObject = try JSONEncoder().encode(self)
        
        guard let dictionary = try JSONSerialization.jsonObject(with: encodedObject, options: .fragmentsAllowed) as? [Any]
        else {
            print(self)
            print(try JSONSerialization.jsonObject(with: encodedObject, options: .fragmentsAllowed))
            throw KycDaoError.genericError
        }
        
        return dictionary
    }
    
}

extension Decodable {
    
    static func decode(from dictionary: [String: Any]) throws -> Self {
        let data = try JSONSerialization.data(withJSONObject: dictionary, options: [])
        let decoder = JSONDecoder()
        return try decoder.decode(Self.self, from: data)
    }
    
}
