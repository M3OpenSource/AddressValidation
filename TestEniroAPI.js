/*
	Sample script for Infor Smart Office to geolocate an address with Eniro API:
	- Sweden (eniro.se)
	- Denmark (krak.dk)
	- Norway (gulesider.no)
	http://api.eniro.com/documentation/cs/search/basic
	Note: Change JSON parser, or use HTTPS for unsafe eval
	PENDING: error handling + background thread + user interface
*/

import System.IO;
import System.Net;
import System.Text;
import System.Web;

package MForms.JScript {
	class TestEniroAPI {
		public function Init(element: Object, args: Object, controller : Object, debug : Object) {
			var profile: String = "abcd"; // from your Eniro account
			var key: String = "1234567890"; // from your Eniro account
			var country: String = "se"; // se,dk,no
			var search_word: String = "matställe";
			var geo_area: String = "Stockholm";
			var url: String = "https://api.eniro.com/cs/search/basic?version=1.1.3&profile=" + profile + "&key=" + key + "&country=" + country + "&search_word=" + HttpUtility.UrlEncode(search_word) + "&geo_area=" + HttpUtility.UrlEncode(geo_area);
			var request: HttpWebRequest = HttpWebRequest(WebRequest.Create(url));
			var response: WebResponse = request.GetResponse();
			var stream: Stream = response.GetResponseStream();
			var reader: StreamReader = new StreamReader(stream, Encoding.UTF8);
			var jsonText: String = reader.ReadToEnd();
			stream.Close();
			response.Close();
			var o: Object = eval('(' + jsonText + ')', 'unsafe');
			for (var i: int in o.adverts) {
				var advert: Object = o.adverts[i];
				debug.WriteLine(
				advert.companyInfo.companyName + ", " +
				advert.address.streetName + ", " +
				advert.address.postCode + ", " +
				advert.address.postArea + ", " +
				advert.address.postBox + ", " +
				advert.location.coordinates[0].latitude + ", " +
				advert.location.coordinates[0].longitude
				);
			}
		}
	}
}
