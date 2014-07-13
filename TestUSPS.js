import System.Xml;
import System.Xml.Linq;

/*
	Sample script for Infor Smart Office to validate a US address with USPS Web Tools
	https://www.usps.com/webtools
	PENDING: replace USERID + error handling + background thread + user interface
*/
package MForms.JScript {
	class TestUSPS {
		public function Init(element: Object, args: Object, controller : Object, debug : Object) {
			// prepare the XML
			var doc: XDocument = new XDocument(
				new XElement("AddressValidateRequest", new XAttribute("USERID", "123USER1234"),
					new XElement("Address",
						new XElement("FirmName", "Ciber"),
						new XElement("Address1", "6363 South Fiddlers Green"),
						new XElement("Address2", ""),
						new XElement("City", "Greenwood Village"),
						new XElement("State", "CO"),
						new XElement("Zip5", ""),
						new XElement("Zip4", ""))));
			// call USPS Web Tools
			var url: String = "https://secure.shippingapis.com/ShippingAPI.dll?API=Verify&XML=" + encodeURI(doc.ToString());
			var response: XDocument = XDocument.Load(url);
			// show result
			if (response.Element("Error")) {
				debug.WriteLine("Error: " + response.Element("Error").Element("Description"));
			} else {
				var address: XElement = response.Element("AddressValidateResponse").Element("Address");
				if (address.Element("Error")) {
					debug.WriteLine("Error: " + address.Element("Error").Element("Description"));
				} else {
					debug.WriteLine(
					address.Element("FirmName") + ", " +
					address.Element("Address1") + ", " +
					address.Element("Address2") + ", " +
					address.Element("City") + ", " +
					address.Element("State") + ", " +
					address.Element("Zip5") + ", " +
					address.Element("Zip4") + "\n" +
					address.Element("ReturnText"));
				}
			}
		}
	}
}
