export interface WcTeamConfig {
  id: string;
  name: string;
  logo: string;
  rating: number;
  starPlayers: string[];
  group: string;
}

export interface WcYearConfig {
  year: number;
  themeColor: string; // Tailwind class or hex for the visual vibe
  description: string;
  teams: WcTeamConfig[];
}

export const WORLD_CUP_YEARS_DATA: Record<number, WcYearConfig> = {
  1998: {
    year: 1998,
    themeColor: "from-blue-700 via-indigo-900 to-red-800",
    description: "La Victoire en Chantant: Hosted in France, won by Zidane's legendary blue generation.",
    teams: [
      // Group A
      { id: "wc_1998_bra", name: "Brazil", logo: "🇧🇷", rating: 95, starPlayers: ["Ronaldo Nazário", "Rivaldo", "Roberto Carlos", "Dunga"], group: "Group A" },
      { id: "wc_1998_nor", name: "Norway", logo: "🇳🇴", rating: 83, starPlayers: ["Tore André Flo", "Ole Gunnar Solskjær", "Henning Berg", "Ronny Johnsen"], group: "Group A" },
      { id: "wc_1998_mar", name: "Morocco", logo: "🇲🇦", rating: 80, starPlayers: ["Mustapha Hadji", "Salaheddine Bassir", "Noureddine Naybet", "Abdelilah Saber"], group: "Group A" },
      { id: "wc_1998_sco", name: "Scotland", logo: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", rating: 78, starPlayers: ["Colin Hendry", "John Collins", "Kevin Gallacher", "Craig Burley"], group: "Group A" },
      // Group B
      { id: "wc_1998_ita", name: "Italy", logo: "🇮🇹", rating: 92, starPlayers: ["Roberto Baggio", "Christian Vieri", "Alessandro Del Piero", "Paolo Maldini"], group: "Group B" },
      { id: "wc_1998_chi", name: "Chile", logo: "🇨🇱", rating: 84, starPlayers: ["Marcelo Salas", "Iván Zamorano", "Javier Margas", "Nelson Parraguez"], group: "Group B" },
      { id: "wc_1998_aut", name: "Austria", logo: "🇦🇹", rating: 78, starPlayers: ["Andreas Herzog", "Toni Polster", "Ivica Vastić", "Peter Schöttel"], group: "Group B" },
      { id: "wc_1998_cmr", name: "Cameroon", logo: "🇨🇲", rating: 80, starPlayers: ["Patrick M'Boma", "Rigobert Song", "François Omam-Biyik", "Samuel Eto'o"], group: "Group B" },
      // Group C
      { id: "wc_1998_fra", name: "France", logo: "🇫🇷", rating: 94, starPlayers: ["Zinedine Zidane", "Thierry Henry", "Didier Deschamps", "Didier Blanc"], group: "Group C" },
      { id: "wc_1998_den", name: "Denmark", logo: "🇩🇰", rating: 84, starPlayers: ["Michael Laudrup", "Brian Laudrup", "Peter Schmeichel", "Ebbe Sand"], group: "Group C" },
      { id: "wc_1998_rsa", name: "South Africa", logo: "🇿🇦", rating: 77, starPlayers: ["Benni McCarthy", "Lucas Radebe", "Quinton Fortune", "Doctor Khumalo"], group: "Group C" },
      { id: "wc_1998_ksa", name: "Saudi Arabia", logo: "🇸🇦", rating: 76, starPlayers: ["Sami Al-Jaber", "Saeed Al-Owairan", "Yousuf Al-Thunayan", "Hussein Abdulghani"], group: "Group C" },
      // Group D
      { id: "wc_1998_nga", name: "Nigeria", logo: "🇳🇬", rating: 85, starPlayers: ["Jay-Jay Okocha", "Nwankwo Kanu", "Taribo West", "Sunday Oliseh"], group: "Group D" },
      { id: "wc_1998_par", name: "Paraguay", logo: "🇵🇾", rating: 82, starPlayers: ["José Luis Chilavert", "Celso Ayala", "Carlos Gamarra", "José Cardozo"], group: "Group D" },
      { id: "wc_1998_esp", name: "Spain", logo: "🇪🇸", rating: 88, starPlayers: ["Raúl González", "Fernando Hierro", "Luis Enrique", "Andoni Zubizarreta"], group: "Group D" },
      { id: "wc_1998_bul", name: "Bulgaria", logo: "🇧🇬", rating: 80, starPlayers: ["Hristo Stoichkov", "Emil Kostadinov", "Krassimir Balakov", "Trifon Ivanov"], group: "Group D" },
      // Group E
      { id: "wc_1998_ned", name: "Netherlands", logo: "🇳🇱", rating: 93, starPlayers: ["Dennis Bergkamp", "Patrick Kluivert", "Edgar Davids", "Jaap Stam"], group: "Group E" },
      { id: "wc_1998_mex", name: "Mexico", logo: "🇲🇽", rating: 84, starPlayers: ["Cuauhtémoc Blanco", "Luis Hernández", "Alberto García Aspe", "Claudio Suárez"], group: "Group E" },
      { id: "wc_1998_bel", name: "Belgium", logo: "🇧🇪", rating: 80, starPlayers: ["Marc Wilmots", "Luc Nilis", "Lorenzo Staelens", "Danny Boffin"], group: "Group E" },
      { id: "wc_1998_kor", name: "South Korea", logo: "🇰🇷", rating: 76, starPlayers: ["Hwang Sun-hong", "Yoo Sang-chul", "Cha Bum-kun", "Kim Byung-ji"], group: "Group E" },
      // Group F
      { id: "wc_1998_ger", name: "Germany", logo: "🇩🇪", rating: 89, starPlayers: ["Oliver Bierhoff", "Jürgen Klinsmann", "Lothar Matthäus", "Andreas Möller"], group: "Group F" },
      { id: "wc_1998_yug", name: "Yugoslavia", logo: "🇷🇸", rating: 84, starPlayers: ["Dragan Stojković", "Predrag Mijatović", "Siniša Mihajlović", "Dejan Savićević"], group: "Group F" },
      { id: "wc_1998_usa", name: "United States", logo: "🇺🇸", rating: 78, starPlayers: ["Claudio Reyna", "Cobi Jones", "Kasey Keller", "Brian McBride"], group: "Group F" },
      { id: "wc_1998_ira", name: "Iran", logo: "🇮🇷", rating: 76, starPlayers: ["Ali Daei", "Khodadad Azizi", "Mehdi Mahdavikia", "Karim Bagheri"], group: "Group F" },
      // Group G
      { id: "wc_1998_rom", name: "Romania", logo: "🇷🇴", rating: 85, starPlayers: ["Gheorghe Hagi", "Dan Petrescu", "Adrian Ilie", "Viorel Moldovan"], group: "Group G" },
      { id: "wc_1998_eng", name: "England", logo: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", rating: 90, starPlayers: ["Alan Shearer", "Michael Owen", "David Beckham", "Tony Adams"], group: "Group G" },
      { id: "wc_1998_col", name: "Colombia", logo: "🇨🇴", rating: 81, starPlayers: ["Carlos Valderrama", "Faustino Asprilla", "Freddy Rincón", "Adolfo Valencia"], group: "Group G" },
      { id: "wc_1998_tun", name: "Tunisia", logo: "🇹🇳", rating: 76, starPlayers: ["Zoubeir Baya", "Adel Sellimi", "Mehdi Ben Slimane", "Ali Boumnijel"], group: "Group G" },
      // Group H
      { id: "wc_1998_arg", name: "Argentina", logo: "🇦🇷", rating: 92, starPlayers: ["Gabriel Batistuta", "Ariel Ortega", "Juan Sebastián Verón", "Diego Simeone"], group: "Group H" },
      { id: "wc_1998_cro", name: "Croatia", logo: "🇭🇷", rating: 87, starPlayers: ["Davor Šuker", "Zvonimir Boban", "Robert Prosinečki", "Aljoša Asanović"], group: "Group H" },
      { id: "wc_1998_jam", name: "Jamaica", logo: "🇯🇲", rating: 76, starPlayers: ["Theodore Whitmore", "Deon Burton", "Robbie Earle", "Warren Barrett"], group: "Group H" },
      { id: "wc_1998_jpn", name: "Japan", logo: "🇯🇵", rating: 77, starPlayers: ["Hidetoshi Nakata", "Masashi Nakayama", "Hiroshi Nanami", "Yoshikatsu Kawaguchi"], group: "Group H" },
    ]
  },
  2006: {
    year: 2006,
    themeColor: "from-blue-600 via-sky-900 to-amber-700",
    description: "A Time to Make Friends: Hosted in Germany, won by Fabio Cannavaro's iron-clad Azzurri.",
    teams: [
      // Group A
      { id: "wc_2006_ger", name: "Germany", logo: "🇩🇪", rating: 90, starPlayers: ["Michael Ballack", "Miroslav Klose", "Lukas Podolski", "Philipp Lahm"], group: "Group A" },
      { id: "wc_2006_ecu", name: "Ecuador", logo: "🇪🇨", rating: 80, starPlayers: ["Agustín Delgado", "Carlos Tenorio", "Antonio Valencia", "Iván Hurtado"], group: "Group A" },
      { id: "wc_2006_pol", name: "Poland", logo: "🇵🇱", rating: 79, starPlayers: ["Maciej Żurawski", "Artur Boruc", "Ebi Smolarek", "Jacek Bąk"], group: "Group A" },
      { id: "wc_2006_crc", name: "Costa Rica", logo: "🇨🇷", rating: 77, starPlayers: ["Paulo Wanchope", "Ronald Gómez", "Walter Centeno", "Gilberto Martínez"], group: "Group A" },
      // Group B
      { id: "wc_2006_eng", name: "England", logo: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", rating: 91, starPlayers: ["Wayne Rooney", "David Beckham", "Steven Gerrard", "John Terry"], group: "Group B" },
      { id: "wc_2006_swe", name: "Sweden", logo: "🇸🇪", rating: 83, starPlayers: ["Zlatan Ibrahimović", "Henrik Larsson", "Freddie Ljungberg", "Olof Mellberg"], group: "Group B" },
      { id: "wc_2006_par", name: "Paraguay", logo: "🇵🇾", rating: 79, starPlayers: ["Nelson Valdez", "Roque Santa Cruz", "Carlos Gamarra", "Roberto Acuña"], group: "Group B" },
      { id: "wc_2006_tri", name: "Trinidad & Tobago", logo: "🇹🇹", rating: 75, starPlayers: ["Dwight Yorke", "Shaka Hislop", "Stern John", "Dennis Lawrence"], group: "Group B" },
      // Group C
      { id: "wc_2006_arg", name: "Argentina", logo: "🇦🇷", rating: 93, starPlayers: ["Juan Román Riquelme", "Hernán Crespo", "Lionel Messi", "Javier Mascherano"], group: "Group C" },
      { id: "wc_2006_ned", name: "Netherlands", logo: "🇳🇱", rating: 89, starPlayers: ["Arjen Robben", "Ruud van Nistelrooy", "Robin van Persie", "Edwin van der Sar"], group: "Group C" },
      { id: "wc_2006_civ", name: "Ivory Coast", logo: "🇨🇮", rating: 82, starPlayers: ["Didier Drogba", "Yaya Touré", "Kolo Touré", "Didier Zokora"], group: "Group C" },
      { id: "wc_2006_scg", name: "Serbia & Montenegro", logo: "🇷🇸", rating: 80, starPlayers: ["Mateja Kežman", "Dejan Stanković", "Siniša Mihajlović", "Nemanja Vidić"], group: "Group C" },
      // Group D
      { id: "wc_2006_por", name: "Portugal", logo: "🇵🇹", rating: 90, starPlayers: ["Luís Figo", "Cristiano Ronaldo", "Deco", "Pauleta"], group: "Group D" },
      { id: "wc_2006_mex", name: "Mexico", logo: "🇲🇽", rating: 84, starPlayers: ["Jared Borgetti", "Rafael Márquez", "Pavel Pardo", "Oswaldo Sánchez"], group: "Group D" },
      { id: "wc_2006_ang", name: "Angola", logo: "🇦🇴", rating: 75, starPlayers: ["Akwa", "Mantorras", "Locó", "João Ricardo"], group: "Group D" },
      { id: "wc_2006_ira", name: "Iran", logo: "🇮🇷", rating: 76, starPlayers: ["Ali Karimi", "Ali Daei", "Vahid Hashemian", "Yahya Golmohammadi"], group: "Group D" },
      // Group E
      { id: "wc_2006_ita", name: "Italy", logo: "🇮🇹", rating: 93, starPlayers: ["Fabio Cannavaro", "Andrea Pirlo", "Gianluigi Buffon", "Francesco Totti"], group: "Group E" },
      { id: "wc_2006_gha", name: "Ghana", logo: "🇬🇭", rating: 82, starPlayers: ["Michael Essien", "Stephen Appiah", "Sulley Muntari", "Asamoah Gyan"], group: "Group E" },
      { id: "wc_2006_cze", name: "Czech Republic", logo: "🇨🇿", rating: 84, starPlayers: ["Pavel Nedvěd", "Jan Koller", "Tomáš Rosický", "Petr Čech"], group: "Group E" },
      { id: "wc_2006_usa", name: "United States", logo: "🇺🇸", rating: 79, starPlayers: ["Landon Donovan", "Clint Dempsey", "Kasey Keller", "Brian McBride"], group: "Group E" },
      // Group F
      { id: "wc_2006_bra", name: "Brazil", logo: "🇧🇷", rating: 95, starPlayers: ["Ronaldinho Gaucho", "Ronaldo Nazário", "Kaká", "Adriano"], group: "Group F" },
      { id: "wc_2006_aus", name: "Australia", logo: "🇦🇺", rating: 81, starPlayers: ["Tim Cahill", "Mark Viduka", "Harry Kewell", "Mark Schwarzer"], group: "Group F" },
      { id: "wc_2006_cro", name: "Croatia", logo: "🇭🇷", rating: 80, starPlayers: ["Dado Pršo", "Niko Kovač", "Darijo Srna", "Luka Modrić"], group: "Group F" },
      { id: "wc_2006_jpn", name: "Japan", logo: "🇯🇵", rating: 78, starPlayers: ["Hidetoshi Nakata", "Shunsuke Nakamura", "Naohiro Takahara", "Tsuneyasu Miyamoto"], group: "Group F" },
      // Group G
      { id: "wc_2006_fra", name: "France", logo: "🇫🇷", rating: 92, starPlayers: ["Zinedine Zidane", "Thierry Henry", "Patrick Vieira", "Franck Ribéry"], group: "Group G" },
      { id: "wc_2006_sui", name: "Switzerland", logo: "🇨🇭", rating: 81, starPlayers: ["Alexander Frei", "Tranquillo Barnetta", "Philippe Senderos", "Patrick Müller"], group: "Group G" },
      { id: "wc_2006_kor", name: "South Korea", logo: "🇰🇷", rating: 79, starPlayers: ["Park Ji-sung", "Ahn Jung-hwan", "Lee Young-pyo", "Lee Woon-jae"], group: "Group G" },
      { id: "wc_2006_tog", name: "Togo", logo: "🇹🇬", rating: 75, starPlayers: ["Emmanuel Adebayor", "Mohamed Kader", "Jean-Paul Abalo", "Kossi Agassa"], group: "Group G" },
      // Group H
      { id: "wc_2006_esp", name: "Spain", logo: "🇪🇸", rating: 89, starPlayers: ["Raúl González", "David Villa", "Fernando Torres", "Xavi Hernández"], group: "Group H" },
      { id: "wc_2006_ukr", name: "Ukraine", logo: "🇺🇦", rating: 83, starPlayers: ["Andriy Shevchenko", "Serhiy Rebrov", "Anatoliy Tymoshchuk", "Oleksandr Shovkovskiy"], group: "Group H" },
      { id: "wc_2006_tun", name: "Tunisia", logo: "🇹🇳", rating: 76, starPlayers: ["Ziad Jaziri", "Radhi Jaïdi", "Hatem Trabelsi", "Ali Boumnijel"], group: "Group H" },
      { id: "wc_2006_ksa", name: "Saudi Arabia", logo: "🇸🇦", rating: 76, starPlayers: ["Yasser Al-Qahtani", "Sami Al-Jaber", "Mohamed Al-Deayea", "Hamad Al-Montashari"], group: "Group H" },
    ]
  },
  2014: {
    year: 2014,
    themeColor: "from-green-600 via-yellow-700 to-blue-800",
    description: "All in One Rhythm: Hosted in Brazil, won by Germany's tactical pressing machine.",
    teams: [
      // Group A
      { id: "wc_2014_bra", name: "Brazil", logo: "🇧🇷", rating: 92, starPlayers: ["Neymar Jr", "Thiago Silva", "Oscar", "Dani Alves"], group: "Group A" },
      { id: "wc_2014_mex", name: "Mexico", logo: "🇲🇽", rating: 84, starPlayers: ["Guillermo Ochoa", "Oribe Peralta", "Andrés Guardado", "Rafael Márquez"], group: "Group A" },
      { id: "wc_2014_cro", name: "Croatia", logo: "🇭🇷", rating: 82, starPlayers: ["Luka Modrić", "Ivan Rakitić", "Mario Mandžukić", "Ivica Olić"], group: "Group A" },
      { id: "wc_2014_cmr", name: "Cameroon", logo: "🇨🇲", rating: 78, starPlayers: ["Samuel Eto'o", "Nicolas N'Koulou", "Alex Song", "Stéphane Mbia"], group: "Group A" },
      // Group B
      { id: "wc_2014_ned", name: "Netherlands", logo: "🇳🇱", rating: 91, starPlayers: ["Arjen Robben", "Robin van Persie", "Wesley Sneijder", "Ron Vlaar"], group: "Group B" },
      { id: "wc_2014_chi", name: "Chile", logo: "🇨🇱", rating: 85, starPlayers: ["Alexis Sánchez", "Arturo Vidal", "Eduardo Vargas", "Claudio Bravo"], group: "Group B" },
      { id: "wc_2014_esp", name: "Spain", logo: "🇪🇸", rating: 89, starPlayers: ["Andrés Iniesta", "Xavi", "Iker Casillas", "Sergio Ramos"], group: "Group B" },
      { id: "wc_2014_aus", name: "Australia", logo: "🇦🇺", rating: 77, starPlayers: ["Tim Cahill", "Mile Jedinak", "Mathew Ryan", "Matthew Spiranovic"], group: "Group B" },
      // Group C
      { id: "wc_2014_col", name: "Colombia", logo: "🇨🇴", rating: 89, starPlayers: ["James Rodríguez", "Juan Cuadrado", "Jackson Martínez", "David Ospina"], group: "Group C" },
      { id: "wc_2014_gre", name: "Greece", logo: "🇬🇷", rating: 81, starPlayers: ["Georgios Samaras", "Sokratis Papastathopoulos", "Kostas Manolas", "Orestis Karnezis"], group: "Group C" },
      { id: "wc_2014_civ", name: "Ivory Coast", logo: "🇨🇮", rating: 81, starPlayers: ["Wilfried Bony", "Gervinho", "Yaya Touré", "Didier Drogba"], group: "Group C" },
      { id: "wc_2014_jpn", name: "Japan", logo: "🇯🇵", rating: 79, starPlayers: ["Keisuke Honda", "Shinji Kagawa", "Shinji Okazaki", "Atsuto Uchida"], group: "Group C" },
      // Group D
      { id: "wc_2014_crc", name: "Costa Rica", logo: "🇨🇷", rating: 85, starPlayers: ["Bryan Ruiz", "Joel Campbell", "Keylor Navas", "Celso Borges"], group: "Group D" },
      { id: "wc_2014_ury", name: "Uruguay", logo: "🇺🇾", rating: 85, starPlayers: ["Luis Suárez", "Edinson Cavani", "Diego Godín", "Fernando Muslera"], group: "Group D" },
      { id: "wc_2014_ita", name: "Italy", logo: "🇮🇹", rating: 83, starPlayers: ["Mario Balotelli", "Andrea Pirlo", "Gianluigi Buffon", "Claudio Marchisio"], group: "Group D" },
      { id: "wc_2014_eng", name: "England", logo: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", rating: 82, starPlayers: ["Daniel Sturridge", "Wayne Rooney", "Steven Gerrard", "Gary Cahill"], group: "Group D" },
      // Group E
      { id: "wc_2014_fra", name: "France", logo: "🇫🇷", rating: 90, starPlayers: ["Karim Benzema", "Paul Pogba", "Antoine Griezmann", "Raphaël Varane"], group: "Group E" },
      { id: "wc_2014_sui", name: "Switzerland", logo: "🇨🇭", rating: 83, starPlayers: ["Xherdan Shaqiri", "Granit Xhaka", "Ricardo Rodríguez", "Diego Benaglio"], group: "Group E" },
      { id: "wc_2014_ecu", name: "Ecuador", logo: "🇪🇨", rating: 80, starPlayers: ["Enner Valencia", "Jefferson Montero", "Christian Noboa", "Alexander Domínguez"], group: "Group E" },
      { id: "wc_2014_hon", name: "Honduras", logo: "🇭🇳", rating: 76, starPlayers: ["Carlo Costly", "Jerry Bengtson", "Maynor Figueroa", "Noel Valladares"], group: "Group E" },
      // Group F
      { id: "wc_2014_arg", name: "Argentina", logo: "🇦🇷", rating: 93, starPlayers: ["Lionel Messi", "Ángel Di María", "Javier Mascherano", "Gonzalo Higuaín"], group: "Group F" },
      { id: "wc_2014_nga", name: "Nigeria", logo: "🇳🇬", rating: 82, starPlayers: ["Ahmed Musa", "Emmanuel Emenike", "Vincent Enyeama", "John Obi Mikel"], group: "Group F" },
      { id: "wc_2014_bih", name: "Bosnia", logo: "🇧🇦", rating: 80, starPlayers: ["Edin Džeko", "Miralem Pjanić", "Asmir Begović", "Senad Lulić"], group: "Group F" },
      { id: "wc_2014_irn", name: "Iran", logo: "🇮🇷", rating: 77, starPlayers: ["Reza Ghoochannejhad", "Ashkan Dejagah", "Javad Nekounam", "Alireza Haghighi"], group: "Group F" },
      // Group G
      { id: "wc_2014_ger", name: "Germany", logo: "🇩🇪", rating: 94, starPlayers: ["Thomas Müller", "Toni Kroos", "Manuel Neuer", "Philipp Lahm"], group: "Group G" },
      { id: "wc_2014_usa", name: "United States", logo: "🇺🇸", rating: 83, starPlayers: ["Clint Dempsey", "Tim Howard", "Michael Bradley", "Jermaine Jones"], group: "Group G" },
      { id: "wc_2014_por", name: "Portugal", logo: "🇵🇹", rating: 84, starPlayers: ["Cristiano Ronaldo", "Nani", "Pepe", "Rui Patrício"], group: "Group G" },
      { id: "wc_2014_gha", name: "Ghana", logo: "🇬🇭", rating: 80, starPlayers: ["Asamoah Gyan", "André Ayew", "Christian Atsu", "Fatau Dauda"], group: "Group G" },
      // Group H
      { id: "wc_2014_bel", name: "Belgium", logo: "🇧🇪", rating: 88, starPlayers: ["Eden Hazard", "Kevin De Bruyne", "Romelu Lukaku", "Vincent Kompany"], group: "Group H" },
      { id: "wc_2014_dza", name: "Algeria", logo: "🇩🇿", rating: 82, starPlayers: ["Islam Slimani", "Sofiane Feghouli", "Yacine Brahimi", "Rais M'Bolhi"], group: "Group H" },
      { id: "wc_2014_rus", name: "Russia", logo: "🇷🇺", rating: 80, starPlayers: ["Aleksandr Kokorin", "Alan Dzagoev", "Sergei Ignashevich", "Igor Akinfeev"], group: "Group H" },
      { id: "wc_2014_kor", name: "South Korea", logo: "🇰🇷", rating: 78, starPlayers: ["Son Heung-min", "Koo Ja-cheol", "Ki Sung-yueng", "Jung Sung-ryong"], group: "Group H" },
    ]
  },
  2022: {
    year: 2022,
    themeColor: "from-red-800 via-amber-900 to-red-950",
    description: "Now is All: Hosted in Qatar, crowned by Messi's legendary triumph with Argentina.",
    teams: [
      // Group A
      { id: "wc_2022_ned", name: "Netherlands", logo: "🇳🇱", rating: 89, starPlayers: ["Cody Gakpo", "Frenkie de Jong", "Virgil van Dijk", "Andries Noppert"], group: "Group A" },
      { id: "wc_2022_sen", name: "Senegal", logo: "🇸🇳", rating: 83, starPlayers: ["Boulaye Dia", "Kalidou Koulibaly", "Édouard Mendy", "Ismaïla Sarr"], group: "Group A" },
      { id: "wc_2022_ecu", name: "Ecuador", logo: "🇪🇨", rating: 81, starPlayers: ["Enner Valencia", "Pervis Estupiñán", "Piero Hincapié", "Moisés Caicedo"], group: "Group A" },
      { id: "wc_2022_qat", name: "Qatar", logo: "🇶🇦", rating: 75, starPlayers: ["Almoez Ali", "Akram Afif", "Hassan Al-Haydos", "Saad Al-Sheeb"], group: "Group A" },
      // Group B
      { id: "wc_2022_eng", name: "England", logo: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", rating: 91, starPlayers: ["Harry Kane", "Marcus Rashford", "Jude Bellingham", "Bukayo Saka"], group: "Group B" },
      { id: "wc_2022_usa", name: "United States", logo: "🇺🇸", rating: 83, starPlayers: ["Christian Pulisic", "Timothy Weah", "Tyler Adams", "Matt Turner"], group: "Group B" },
      { id: "wc_2022_irn", name: "Iran", logo: "🇮🇷", rating: 78, starPlayers: ["Mehdi Taremi", "Sardar Azmoun", "Alireza Beiranvand", "Ramin Rezaeian"], group: "Group B" },
      { id: "wc_2022_wal", name: "Wales", logo: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", rating: 78, starPlayers: ["Gareth Bale", "Aaron Ramsey", "Wayne Hennessey", "Ben Davies"], group: "Group B" },
      // Group C
      { id: "wc_2022_arg", name: "Argentina", logo: "🇦🇷", rating: 94, starPlayers: ["Lionel Messi", "Ángel Di María", "Emiliano Martínez", "Enzo Fernández"], group: "Group C" },
      { id: "wc_2022_pol", name: "Poland", logo: "🇵🇱", rating: 82, starPlayers: ["Robert Lewandowski", "Piotr Zieliński", "Wojciech Szczęsny", "Kamil Glik"], group: "Group C" },
      { id: "wc_2022_mex", name: "Mexico", logo: "🇲🇽", rating: 80, starPlayers: ["Luis Chávez", "Henry Martín", "Guillermo Ochoa", "César Montes"], group: "Group C" },
      { id: "wc_2022_ksa", name: "Saudi Arabia", logo: "🇸🇦", rating: 78, starPlayers: ["Salem Al-Dawsari", "Saleh Al-Shehri", "Mohammed Al-Owais", "Yasser Al-Shahrani"], group: "Group C" },
      // Group D
      { id: "wc_2022_fra", name: "France", logo: "🇫🇷", rating: 93, starPlayers: ["Kylian Mbappé", "Olivier Giroud", "Antoine Griezmann", "Hugo Lloris"], group: "Group D" },
      { id: "wc_2022_aus", name: "Australia", logo: "🇦🇺", rating: 81, starPlayers: ["Mathew Leckie", "Craig Goodwin", "Mathew Ryan", "Harry Souttar"], group: "Group D" },
      { id: "wc_2022_tun", name: "Tunisia", logo: "🇹🇳", rating: 79, starPlayers: ["Wahbi Khazri", "Aïssa Laïdouni", "Ellyes Skhiri", "Aymen Dahmen"], group: "Group D" },
      { id: "wc_2022_den", name: "Denmark", logo: "🇩🇰", rating: 82, starPlayers: ["Christian Eriksen", "Pierre-Emile Højbjerg", "Andreas Christensen", "Kasper Schmeichel"], group: "Group D" },
      // Group E
      { id: "wc_2022_jpn", name: "Japan", logo: "🇯🇵", rating: 85, starPlayers: ["Ritsu Doan", "Ao Tanaka", "Kaoru Mitoma", "Shuichi Gonda"], group: "Group E" },
      { id: "wc_2022_esp", name: "Spain", logo: "🇪🇸", rating: 88, starPlayers: ["Álvaro Morata", "Gavi", "Pedri", "Unai Simón"], group: "Group E" },
      { id: "wc_2022_ger", name: "Germany", logo: "🇩🇪", rating: 85, starPlayers: ["Jamal Musiala", "Kai Havertz", "Niclas Füllkrug", "Manuel Neuer"], group: "Group E" },
      { id: "wc_2022_crc", name: "Costa Rica", logo: "🇨🇷", rating: 77, starPlayers: ["Keysher Fuller", "Keylor Navas", "Yeltsin Tejeda", "Francisco Calvo"], group: "Group E" },
      // Group F
      { id: "wc_2022_mar", name: "Morocco", logo: "🇲🇦", rating: 90, starPlayers: ["Yassine Bounou", "Achraf Hakimi", "Hakim Ziyech", "Sofyan Amrabat"], group: "Group F" },
      { id: "wc_2022_cro", name: "Croatia", logo: "🇭🇷", rating: 88, starPlayers: ["Luka Modrić", "Mateo Kovačić", "Ivan Perišić", "Dominik Livaković"], group: "Group F" },
      { id: "wc_2022_bel", name: "Belgium", logo: "🇧🇪", rating: 81, starPlayers: ["Kevin De Bruyne", "Romelu Lukaku", "Thibaut Courtois", "Eden Hazard"], group: "Group F" },
      { id: "wc_2022_can", name: "Canada", logo: "🇨🇦", rating: 78, starPlayers: ["Alphonso Davies", "Jonathan David", "Tajon Buchanan", "Milan Borjan"], group: "Group F" },
      // Group G
      { id: "wc_2022_bra", name: "Brazil", logo: "🇧🇷", rating: 91, starPlayers: ["Neymar Jr", "Richarlison", "Casemiro", "Alisson Becker"], group: "Group G" },
      { id: "wc_2022_sui", name: "Switzerland", logo: "🇨🇭", rating: 83, starPlayers: ["Breel Embolo", "Xherdan Shaqiri", "Yann Sommer", "Granit Xhaka"], group: "Group G" },
      { id: "wc_2022_cmr", name: "Cameroon", logo: "🇨🇲", rating: 80, starPlayers: ["Vincent Aboubakar", "Jean-Charles Castelletto", "Devis Epassy", "Eric Maxim Choupo-Moting"], group: "Group G" },
      { id: "wc_2022_srb", name: "Serbia", logo: "🇷🇸", rating: 80, starPlayers: ["Aleksandar Mitrović", "Dušan Vlahović", "Sergej Milinković-Savić", "Vanja Milinković-Savić"], group: "Group G" },
      // Group H
      { id: "wc_2022_por", name: "Portugal", logo: "🇵🇹", rating: 89, starPlayers: ["Bruno Fernandes", "Cristiano Ronaldo", "Diogo Costa", "João Félix"], group: "Group H" },
      { id: "wc_2022_kor", name: "South Korea", logo: "🇰🇷", rating: 83, starPlayers: ["Hwang Hee-chan", "Kim Young-gwon", "Son Heung-min", "Kim Seung-gyu"], group: "Group H" },
      { id: "wc_2022_ury", name: "Uruguay", logo: "🇺🇾", rating: 80, starPlayers: ["Giorgian de Arrascaeta", "Darwin Núñez", "Federico Valverde", "Sergio Rochet"], group: "Group H" },
      { id: "wc_2022_gha", name: "Ghana", logo: "🇬🇭", rating: 78, starPlayers: ["Mohammed Kudus", "André Ayew", "Lawrence Ati-Zigi", "Thomas Partey"], group: "Group H" },
    ]
  },
  2026: {
    year: 2026,
    themeColor: "from-cyan-700 via-sky-950 to-indigo-900",
    description: "United 2026: The upcoming ultimate showdown across North America (dynamic future projections).",
    teams: [
      // Group A
      { id: "wc_2026_usa", name: "United States", logo: "🇺🇸", rating: 87, starPlayers: ["Christian Pulisic", "Folarin Balogun", "Weston McKennie", "Matt Turner"], group: "Group A" },
      { id: "wc_2026_ecu", name: "Ecuador", logo: "🇪🇨", rating: 84, starPlayers: ["Moisés Caicedo", "Piero Hincapié", "Willian Pacho", "Kendry Páez"], group: "Group A" },
      { id: "wc_2026_sen", name: "Senegal", logo: "🇸🇳", rating: 81, starPlayers: ["Nicolas Jackson", "Pape Matar Sarr", "Sadio Mané", "Édouard Mendy"], group: "Group A" },
      { id: "wc_2026_nzl", name: "New Zealand", logo: "🇳🇿", rating: 76, starPlayers: ["Chris Wood", "Liberato Cacace", "Joe Bell", "Alex Paulsen"], group: "Group A" },
      // Group B
      { id: "wc_2026_esp", name: "Spain", logo: "🇪🇸", rating: 93, starPlayers: ["Lamine Yamal", "Nico Williams", "Rodri", "Pedri"], group: "Group B" },
      { id: "wc_2026_cro", name: "Croatia", logo: "🇭🇷", rating: 84, starPlayers: ["Joško Gvardiol", "Mateo Kovačić", "Martin Baturina", "Dominik Livaković"], group: "Group B" },
      { id: "wc_2026_mar", name: "Morocco", logo: "🇲🇦", rating: 86, starPlayers: ["Achraf Hakimi", "Brahim Díaz", "Amine Adli", "Yassine Bounou"], group: "Group B" },
      { id: "wc_2026_mar_2", name: "Angola", logo: "🇦🇴", rating: 77, starPlayers: ["Gelson Dala", "Mabululu", "Fredy", "Neblú"], group: "Group B" },
      // Group C
      { id: "wc_2026_fra", name: "France", logo: "🇫🇷", rating: 94, starPlayers: ["Kylian Mbappé", "Bradley Barcola", "William Saliba", "N'Golo Kanté"], group: "Group C" },
      { id: "wc_2026_can", name: "Canada", logo: "🇨🇦", rating: 83, starPlayers: ["Alphonso Davies", "Jonathan David", "Stephen Eustáquio", "Maxime Crépeau"], group: "Group C" },
      { id: "wc_2026_egy", name: "Egypt", logo: "🇪🇬", rating: 82, starPlayers: ["Mohamed Salah", "Mostafa Mohamed", "Omar Marmoush", "Trézéguet"], group: "Group C" },
      { id: "wc_2026_irn", name: "Iran", logo: "🇮🇷", rating: 76, starPlayers: ["Mehdi Taremi", "Sardar Azmoun", "Alireza Jahanbakhsh", "Hossein Hosseini"], group: "Group C" },
      // Group D
      { id: "wc_2026_eng", name: "England", logo: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", rating: 93, starPlayers: ["Jude Bellingham", "Phil Foden", "Cole Palmer", "Bukayo Saka"], group: "Group D" },
      { id: "wc_2026_sui", name: "Switzerland", logo: "🇨🇭", rating: 83, starPlayers: ["Manuel Akanji", "Granit Xhaka", "Dan Ndoye", "Gregor Kobel"], group: "Group D" },
      { id: "wc_2026_korea", name: "South Korea", logo: "🇰🇷", rating: 83, starPlayers: ["Son Heung-min", "Kim Min-jae", "Lee Kang-in", "Hwang Hee-chan"], group: "Group D" },
      { id: "wc_2026_uga", name: "Uganda", logo: "🇺🇬", rating: 75, starPlayers: ["Travis Mutyaba", "Rogers Mato", "Denis Onyango", "Allan Okello"], group: "Group D" },
      // Group E
      { id: "wc_2026_ger", name: "Germany", logo: "🇩🇪", rating: 91, starPlayers: ["Florian Wirtz", "Jamal Musiala", "Jonathan Tah", "Marc-André ter Stegen"], group: "Group E" },
      { id: "wc_2026_jpn", name: "Japan", logo: "🇯🇵", rating: 86, starPlayers: ["Kaoru Mitoma", "Takefusa Kubo", "Wataru Endo", "Zion Suzuki"], group: "Group E" },
      { id: "wc_2026_col", name: "Colombia", logo: "🇨🇴", rating: 85, starPlayers: ["Luis Díaz", "James Rodríguez", "Daniel Muñoz", "Camilo Vargas"], group: "Group E" },
      { id: "wc_2026_jam", name: "Jamaica", logo: "🇯🇲", rating: 77, starPlayers: ["Leon Bailey", "Michail Antonio", "Demarai Gray", "Andre Blake"], group: "Group E" },
      // Group F
      { id: "wc_2026_por", name: "Portugal", logo: "🇵🇹", rating: 90, starPlayers: ["Rafael Leão", "João Neves", "Bruno Fernandes", "Diogo Costa"], group: "Group F" },
      { id: "wc_2026_tur", name: "Turkey", logo: "🇹🇷", rating: 84, starPlayers: ["Arda Güler", "Kenan Yıldız", "Hakan Çalhanoğlu", "Mert Günok"], group: "Group F" },
      { id: "wc_2026_mex", name: "Mexico", logo: "🇲🇽", rating: 82, starPlayers: ["Santiago Giménez", "Edson Álvarez", "Luis Chávez", "Guillermo Ochoa"], group: "Group F" },
      { id: "wc_2026_fij", name: "Fiji", logo: "🇫🇯", rating: 75, starPlayers: ["Roy Krishna", "Sairusi Nalaubu", "Filipe Baravilala", "Simione Tamanisau"], group: "Group F" },
      // Group G
      { id: "wc_2026_arg", name: "Argentina", logo: "🇦🇷", rating: 92, starPlayers: ["Lautaro Martínez", "Julian Álvarez", "Alexis Mac Allister", "Emiliano Martínez"], group: "Group G" },
      { id: "wc_2026_ukr", name: "Ukraine", logo: "🇺🇦", rating: 83, starPlayers: ["Artem Dovbyk", "Mykhailo Mudryk", "Georgiy Sudakov", "Andriy Lunin"], group: "Group G" },
      { id: "wc_2026_uru", name: "Uruguay", logo: "🇺🇾", rating: 85, starPlayers: ["Darwin Núñez", "Federico Valverde", "Manuel Ugarte", "Sergio Rochet"], group: "Group G" },
      { id: "wc_2026_uzb", name: "Uzbekistan", logo: "🇺🇿", rating: 78, starPlayers: ["Eldor Shomurodov", "Abbosbek Fayzullaev", "Oston Urunov", "Utkir Yusupov"], group: "Group G" },
      // Group H
      { id: "wc_2026_bra", name: "Brazil", logo: "🇧🇷", rating: 91, starPlayers: ["Vinícius Júnior", "Rodrygo", "Endrick", "Ederson"], group: "Group H" },
      { id: "wc_2026_ned", name: "Netherlands", logo: "🇳🇱", rating: 88, starPlayers: ["Xavi Simons", "Jeremie Frimpong", "Micky van de Ven", "Bart Verbruggen"], group: "Group H" },
      { id: "wc_2026_nga", name: "Nigeria", logo: "🇳🇬", rating: 82, starPlayers: ["Victor Osimhen", "Ademola Lookman", "Victor Boniface", "Stanley Nwabali"], group: "Group H" },
      { id: "wc_2026_irq", name: "Iraq", logo: "🇮🇶", rating: 77, starPlayers: ["Aymen Hussein", "Ali Jasim", "Youssef Amyn", "Jalal Hassan"], group: "Group H" },
    ]
  }
};
