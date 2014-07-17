import System;
import System.IO;
import System.Net;
import System.Xml;
import System.Xml.Linq;

/*
	Sample script for Infor Smart Office to validate addresses with the UPS Street Level API
	PENDING: replace authentication and address values + error handling + background thread + user interface
	https://www.ups.com/upsdeveloperkit
*/

package MForms.JScript {
	class TestUPS {
		public function Init(element: Object, args: Object, controller : Object, debug : Object) {
			// authentication
			var doc1: XDocument = new XDocument(
				new XDeclaration("1.0", "utf-8"),
				new XElement("AccessRequest",
					new XElement("AccessLicenseNumber", "****************"),
					new XElement("UserId", "******"),
					new XElement("Password", "********")
				)
			);
			// address
			var doc2: XDocument = new XDocument(
				new XDeclaration("1.0", "utf-8"),
				new XElement("AddressValidationRequest",
					new XElement("Request",
						new XElement("TransactionReference",
							new XElement("CustomerContext", "Infor Smart Office"),
							new XElement("XpciVersion", "1.0"),
						),
						new XElement("RequestAction", "XAV"),
						new XElement("RequestOption", "3")
					),
					new XElement("AddressKeyFormat",
						new XElement("ConsigneeName", "Ciber"),          // Name
						new XElement("BuildingName", ""),
						new XElement("AddressLine", "Fiddlers Green"),   // Address line 1
						new XElement("AddressLine", ""),                 // Address line 2
						new XElement("AddressLine", ""),                 // Address line 3
						new XElement("AddressLine", ""),                 // Address line 4
						new XElement("Region", ""),
						new XElement("PoliticalDivision2", "Greenwd"),   // City
						new XElement("PoliticalDivision1", "CO"),        // State
						new XElement("PostcodePrimaryLow", ""),          // Zip5
						new XElement("PostcodeExtendedLow", ""),         // Zip4
						new XElement("Urbanization", ""),
						new XElement("CountryCode", "US")                // Country
					)
				)
			);
			// concatenate both XML docs
			var sw: StringWriter = new StringWriter();
			doc1.Save(sw);
			doc2.Save(sw);
			var docs: String = sw.GetStringBuilder().ToString();
			// HTTP request
			var request: HttpWebRequest = HttpWebRequest(WebRequest.Create("https://onlinetools.ups.com/ups.app/xml/XAV"));
			request.Method = "POST";
			var byteArray: byte[] = System.Text.Encoding.UTF8.GetBytes(docs);
			var dataStream: Stream = request.GetRequestStream();
			dataStream.Write(byteArray, 0, byteArray.Length);
			dataStream.Close();
			// HTTP response
			var response: HttpWebResponse = request.GetResponse();
			var data: Stream = response.GetResponseStream();
			var doc: XmlDocument = new XmlDocument();
			doc.Load(data);
			data.Close();
			response.Close();
			// check for errors
			var error: XmlNode = doc.SelectSingleNode("//Response/Error");
			if (error != null) {
				debug.WriteLine("Error " + error.SelectSingleNode("ErrorCode").InnerText + ": " + error.SelectSingleNode("ErrorDescription").InnerText);
				return;
			}
			// show results
			var nodes: XmlNodeList = doc.SelectNodes("//AddressKeyFormat");
			var keys : String[] = [
				"AddressClassification/Description",
				"ConsigneeName",
				"BuildingName",
				"AddressLine[1]",
				"AddressLine[2]",
				"PoliticalDivision2",
				"PoliticalDivision1",
				"PostcodePrimaryLow",
				"PostcodeExtendedLow",
				//"Region",
				"Urbanization",
				"CountryCode"
			];
			for (var node: XmlNode in nodes) {
				for (var i: int in keys) {
					var value: XmlNode = node.SelectSingleNode(keys[i]);
					debug.Write(value != null ? value.InnerText + ", " : "");
				}
				debug.WriteLine("");
			}
		}
	}
}
