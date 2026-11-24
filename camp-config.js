/*
  CDYLC 2028 camp settings
  ------------------------
  Edit this file when details are confirmed. The homepage sign,
  countdown and "Applications open!" banner update automatically.

  Dates use the format "YYYY-MM-DD". Leave a value as "" until it is known.

  Preview the different sign states before going live by adding one of these
  to the end of the homepage address:
    ?preview=countdown   countdown to a sample date
    ?preview=open        "Applications open!"
    ?preview=live        "Camp is happening now!"
*/
window.CDYLC_CONFIG = {
  campStart: "",            // first day of camp, e.g. "2028-07-16"
  campEnd: "",              // last day of camp, e.g. "2028-07-22"
  locationEn: "",           // e.g. "Camp Name, Sylvan Lake, Alberta"
  locationFr: "",           // e.g. "Camp Name, Sylvan Lake (Alberta)"
  applicationsOpen: false,  // change to true when applications open
  applicationUrl: "",       // link to the application form
  applicationsClose: ""     // application deadline, e.g. "2028-03-31"
};
