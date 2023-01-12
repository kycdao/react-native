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
            throw KycDaoError.internal(.unknown)
        }
        
        return dictionary
    }
    
    func encodeToArray() throws -> [Any] {
        let encodedObject = try JSONEncoder().encode(self)
        
        guard let dictionary = try JSONSerialization.jsonObject(with: encodedObject, options: .fragmentsAllowed) as? [Any]
        else {
            throw KycDaoError.internal(.unknown)
        }
        
        return dictionary
    }
    
    func toJSON(_ encoder: JSONEncoder = JSONEncoder()) throws -> String {
        let data = try encoder.encode(self)
        return String(decoding: data, as: UTF8.self)
    }
    
}

extension Decodable {
    
    static func decode(from dictionary: [String: Any]) throws -> Self {
        let data = try JSONSerialization.data(withJSONObject: dictionary, options: [])
        let decoder = JSONDecoder()
        return try decoder.decode(Self.self, from: data)
    }
    
}
