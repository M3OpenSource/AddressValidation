/*
	Sample script for Infor Smart Office to validate an address with Eniro Geocode.
	http://www.krakmapapi.dk/20120410enirogetapidocumentation.pdf
	PENDING: error handling + background thread + user interface
*/
import System.Web;
import System.Xml;
package MForms.JScript {
	class TestEniroGeocode {
		public function Init(element: Object, args: Object, controller : Object, debug : Object) {
			var address: String = "Borgarfjordsg, KISTA";
			var url: String = "http://map.eniro.se/api/geocode?type=any&contentType=xml&name=" + HttpUtility.UrlEncode(address);
			var doc: XmlDocument = new XmlDocument();
			doc.Load(url);
			var locations: XmlNodeList = doc.SelectNodes("//locations");
			for (var location: XmlNode in locations) {
				debug.WriteLine(
				location.SelectSingleNode("addressId").InnerText + ", " +
				location.SelectSingleNode("locationType").InnerText + ", " +
				location.SelectSingleNode("roadname").InnerText + ", " +
				location.SelectSingleNode("housenumber").InnerText + ", " +
				location.SelectSingleNode("placename").InnerText + ", " +
				location.SelectSingleNode("zip").InnerText + ", " +
				location.SelectSingleNode("postarea").InnerText + ", " +
				location.SelectSingleNode("city").InnerText + ", " +
				location.SelectSingleNode("municipality").InnerText + ", " +
				location.SelectSingleNode("municipalityId").InnerText + ", " +
				location.SelectSingleNode("country").InnerText + ", " +
				location.SelectSingleNode("placementCoordinate/y").InnerText + ", " +
				location.SelectSingleNode("placementCoordinate/x").InnerText);
			}
		}
	}
}
