# Bib-Hierarchy Alma Cloud App
<img align="right" src="./cloudapp/src/assets/app-icon.png" width="100" style="border-radius: 3px">

An [ExLibris Alma CloudApp](https://developers.exlibrisgroup.com/cloudapps/), which allows to display bibliographic hierarchies in Alma. This App is heavily inspired by https://github.com/gabriele-h/bib-hierarchy.
<br>
<br>

## How to use
* Search for any Bib-Record in Alma
* Open the Bib-Hierarchy Cloud App
* Click 'Show hierarchy' on the entry you're intrested in
* Wait(, wait a bit longer)
* See all related records
* Click 'Expand View' to see a nice table, or click export to download the result as Excel file

## Configuration
To submit an SRU request, the app needs the Alma URL and the network code. The app tries to auto configure both values via the Alma API. In case the auto configured values are not correct, it is possible to set both values in the app config (wrench icon) for the IZ or the current user (cogwheel icon).
* The Alma Url should look like `https://<region>.alma.exlibrisgroup.com` where region is something like `eu03` or `na02`
* The network code should look like `<network-prefix>_NETWORK`, eg. `41SLSP_NETWORK`

## How does it work
The result data is retrieved via SRU (see [SRU documentation](https://developers.exlibrisgroup.com/alma/integrations/sru/)), this means SRU must be enabled, otherwise this app will not work ([how to enable SRU](https://knowledge.exlibrisgroup.com/Alma/Product_Documentation/010Alma_Online_Help_(English)/090Integrations_with_External_Systems/030Resource_Management/190SRU_SRW_Search#)).

1. Find the NZ MMS ID via Alma API
2. Get the record via SRU
3. Parse out 'other system numbers' from field 035$a
4. Query SRU for 'other_system_numbers' with the result from the previous step
5. Parse the result and display as nice table

## Which fields are used
To display the result table, the following fields are used. If this does not work for you, please open an issue on Github.

* Order: `800$v`, `810$v`, `830$v`, `773$q`
* Title: `245`
* Year: `008` (substring 7,11)
* Edition: `250`
* MMS ID: `001` (controllfield)
* Duplicate: records with the same order and edition are marked as duplicates
* Holding: `852$a`

## Example SRU queries
Example queries for 'Gesamtausgabe Martin Heidegger, Heidegger, Martin', MMS ID (NZ): 991012502969705501

1. Get record by MMS ID: `https://eu03.alma.exlibrisgroup.com/view/sru/41SLSP_NETWORK?version=1.2&operation=searchRetrieve&recordSchema=marcxml&query=mms_id=991012502969705501&startRecord=1&maximumRecords=50`
<details>
<summary>result</summary>

```xml
<?xml version="1.0" encoding="UTF-8" standalone="no"?><searchRetrieveResponse xmlns="http://www.loc.gov/zing/srw/">
  <version>1.2</version>
  <numberOfRecords>1</numberOfRecords>
  <records>
    <record>
      <recordSchema>marcxml</recordSchema>
      <recordPacking>xml</recordPacking>
      <recordData>
        <record xmlns="http://www.loc.gov/MARC21/slim">
          <leader>02482nam a2200529 ca4500</leader>
          <controlfield tag="001">991012502969705501</controlfield>
          <controlfield tag="005">20220614110045.0</controlfield>
          <controlfield tag="008">201012m19752022gw            00| | ger^^</controlfield>
          <datafield ind1=" " ind2=" " tag="019">
            <subfield code="a">Übergeordnete Aufnahme = Niveau supérieur = Livello superiore</subfield>
            <subfield code="5">SLSP/2020</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="035">
            <subfield code="a">(swissbib)236405489-41slsp_network</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="035">
            <subfield code="a">236405489</subfield>
            <subfield code="9">ExL</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="035">
            <subfield code="a">(IDSSG)000007681HSB01</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="035">
            <subfield code="a">(IDSLU)000189797ILU01</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="035">
            <subfield code="a">(NEBIS)000993231EBI01</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="035">
            <subfield code="a">(SBT)000737306SBT01</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="035">
            <subfield code="a">(RERO)1341820-41slsp</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="040">
            <subfield code="a">SzZuIDS HSG</subfield>
            <subfield code="b">ger</subfield>
            <subfield code="e">rda</subfield>
            <subfield code="d">CH-ZuSLS</subfield>
          </datafield>
          <datafield ind1=" " ind2="7" tag="072">
            <subfield code="a">100</subfield>
            <subfield code="2">IDS LU</subfield>
          </datafield>
          <datafield ind1=" " ind2="7" tag="072">
            <subfield code="a">ph</subfield>
            <subfield code="2">rero</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="084">
            <subfield code="a">CI 2600</subfield>
            <subfield code="2">rvk</subfield>
          </datafield>
          <datafield ind1="1" ind2=" " tag="100">
            <subfield code="6">880-01</subfield>
            <subfield code="a">Heidegger, Martin</subfield>
            <subfield code="d">1889-1976</subfield>
            <subfield code="0">(DE-588)118547798</subfield>
            <subfield code="4">aut</subfield>
          </datafield>
          <datafield ind1="1" ind2=" " tag="880">
            <subfield code="6">100-01</subfield>
            <subfield code="a">Heidegger, Martin</subfield>
            <subfield code="0">(SBT11)000003924</subfield>
            <subfield code="4">aut</subfield>
          </datafield>
          <datafield ind1="1" ind2=" " tag="880">
            <subfield code="6">100-01</subfield>
            <subfield code="a">Heidegger, Martin</subfield>
            <subfield code="d">1889-1976</subfield>
            <subfield code="0">(IDREF)026917548</subfield>
            <subfield code="4">aut</subfield>
          </datafield>
          <datafield ind1="1" ind2="0" tag="240">
            <subfield code="a">Werke</subfield>
          </datafield>
          <datafield ind1="1" ind2="0" tag="245">
            <subfield code="a">Gesamtausgabe</subfield>
            <subfield code="c">Martin Heidegger</subfield>
          </datafield>
          <datafield ind1=" " ind2="1" tag="264">
            <subfield code="a">Frankfurt am Main</subfield>
            <subfield code="b">Vittorio Klostermann</subfield>
            <subfield code="c">1975-[2022]</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="300">
            <subfield code="a">102 Bände</subfield>
            <subfield code="c">21 cm</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="336">
            <subfield code="b">txt</subfield>
            <subfield code="2">rdacontent</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="337">
            <subfield code="b">n</subfield>
            <subfield code="2">rdamedia</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="338">
            <subfield code="b">nc</subfield>
            <subfield code="2">rdacarrier</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="500">
            <subfield code="a">Werk gegliedert in 4 Abteilungen (Einzelbände durchgehend numeriert): 1. Abteilung = Band 1-16: Veröffentlichte Schriften ; 2. Abteilung = Band 17-63: Vorlesungen ; 3. Abteilung   = Band 64-81: Unveröffentlichte Abhandlungen, Vorträge - Gedachtes ; 4. Abteilung = Band 82-102: Hinweise und Aufzeichnungen</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="500">
            <subfield code="a">2. Abteilung: Vorlesungen 1919-1944, aufgeteilt in: Marburger Vorlesungen und Freiburger Vorlesungen</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="500">
            <subfield code="a">Hier auch später erschienene Auflagen</subfield>
          </datafield>
          <datafield ind1="1" ind2="7" tag="600">
            <subfield code="a">Heidegger, Martin</subfield>
            <subfield code="d">1889-1976</subfield>
            <subfield code="0">(DE-588)118547798</subfield>
            <subfield code="2">gnd</subfield>
          </datafield>
          <datafield ind1="1" ind2="7" tag="600">
            <subfield code="a">Heidegger, Martin</subfield>
            <subfield code="d">1889-1976</subfield>
            <subfield code="0">(IDREF)026917548</subfield>
            <subfield code="2">idref</subfield>
          </datafield>
          <datafield ind1=" " ind2="7" tag="650">
            <subfield code="a">Philosophie</subfield>
            <subfield code="2">gnd</subfield>
            <subfield code="0">(DE-588)4045791-6</subfield>
          </datafield>
          <datafield ind1=" " ind2="7" tag="650">
            <subfield code="a">DEUTSCHLAND (MITTELEUROPA). BUNDESREPUBLIK DEUTSCHLAND</subfield>
            <subfield code="9">ger</subfield>
            <subfield code="0">(ETHUDK)000041967</subfield>
            <subfield code="2">ethudk</subfield>
          </datafield>
          <datafield ind1=" " ind2="7" tag="650">
            <subfield code="a">GESAMMELTE WERKE EINZELNER VERFASSER</subfield>
            <subfield code="9">ger</subfield>
            <subfield code="0">(ETHUDK)000009346</subfield>
            <subfield code="2">ethudk</subfield>
          </datafield>
          <datafield ind1=" " ind2="7" tag="650">
            <subfield code="a">PHILOSOPHIE</subfield>
            <subfield code="9">ger</subfield>
            <subfield code="0">(ETHUDK)000009365</subfield>
            <subfield code="2">ethudk</subfield>
          </datafield>
          <datafield ind1=" " ind2="7" tag="650">
            <subfield code="a">Philosophie allemande</subfield>
            <subfield code="0">(RERO)A023098320</subfield>
            <subfield code="2">rero</subfield>
          </datafield>
          <datafield ind1=" " ind2="7" tag="651">
            <subfield code="a">Allemagne</subfield>
            <subfield code="y">20e siècle</subfield>
            <subfield code="0">(IDREF)027268969</subfield>
            <subfield code="2">idref</subfield>
          </datafield>
          <datafield ind1=" " ind2="7" tag="650">
            <subfield code="a">"1889/1976"</subfield>
            <subfield code="2">ethudk</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="690">
            <subfield code="a">Existenzialphilosophie. A.</subfield>
            <subfield code="2">rzs-L1</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="690">
            <subfield code="a">Philosophie, 20. Jh.</subfield>
            <subfield code="2">uzb-VI</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="691">
            <subfield code="e">193</subfield>
            <subfield code="a">Filosofia occidentale moderna. Germania e Austria</subfield>
            <subfield code="2">usi-TE</subfield>
          </datafield>
          <datafield ind1="0" ind2="1" tag="852">
            <subfield code="a">41SLSP_UGE</subfield>
            <subfield code="6">991009242179705502</subfield>
            <subfield code="9">P</subfield>
          </datafield>
          <datafield ind1="0" ind2="1" tag="852">
            <subfield code="a">41SLSP_UZB</subfield>
            <subfield code="6">990009932310205508</subfield>
            <subfield code="9">P</subfield>
          </datafield>
          <datafield ind1="0" ind2="1" tag="852">
            <subfield code="a">41SLSP_ZHK</subfield>
            <subfield code="6">990009932310205512</subfield>
            <subfield code="9">P</subfield>
          </datafield>
          <datafield ind1="0" ind2="1" tag="852">
            <subfield code="a">41SLSP_FHO</subfield>
            <subfield code="6">99116697746005515</subfield>
            <subfield code="9">P</subfield>
          </datafield>
          <datafield ind1="0" ind2="1" tag="852">
            <subfield code="a">41SLSP_HSG</subfield>
            <subfield code="6">9976810105506</subfield>
            <subfield code="9">P</subfield>
          </datafield>
          <datafield ind1="0" ind2="1" tag="852">
            <subfield code="a">41SLSP_UNE</subfield>
            <subfield code="6">991001759499705517</subfield>
            <subfield code="9">P</subfield>
          </datafield>
          <datafield ind1="0" ind2="1" tag="852">
            <subfield code="a">41SLSP_FNW</subfield>
            <subfield code="6">990009932310205518</subfield>
            <subfield code="9">P</subfield>
          </datafield>
          <datafield ind1="0" ind2="1" tag="852">
            <subfield code="a">41SLSP_ETH</subfield>
            <subfield code="6">990009932310205503</subfield>
            <subfield code="9">P</subfield>
          </datafield>
          <datafield ind1="0" ind2="1" tag="852">
            <subfield code="a">41SLSP_RZS</subfield>
            <subfield code="6">991897970105505</subfield>
            <subfield code="9">P</subfield>
          </datafield>
          <datafield ind1="0" ind2="1" tag="852">
            <subfield code="a">41SLSP_USI</subfield>
            <subfield code="6">990007373060205507</subfield>
            <subfield code="9">P</subfield>
          </datafield>
          <datafield ind1="0" ind2="1" tag="852">
            <subfield code="a">41SLSP_BCUFR</subfield>
            <subfield code="6">991000697029705509</subfield>
            <subfield code="9">P</subfield>
          </datafield>
          <datafield ind1="0" ind2="1" tag="852">
            <subfield code="a">41SLSP_VGE</subfield>
            <subfield code="6">991013047529705524</subfield>
            <subfield code="9">P</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="900">
            <subfield code="d">IDSZ2zbzswk200101b</subfield>
            <subfield code="e">IDSZ2baur</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="903">
            <subfield code="a">RERO-SIGN</subfield>
            <subfield code="5">UNIGE/20221406/lag</subfield>
          </datafield>
        </record>
      </recordData>
      <recordIdentifier>991012502969705501</recordIdentifier>
      <recordPosition>1</recordPosition>
    </record>
  </records>
  <extraResponseData xmlns:xb="http://www.exlibris.com/repository/search/xmlbeans/">
    <xb:exact>true</xb:exact>
    <xb:responseDate>2022-12-22T09:59:07+0100</xb:responseDate>
  </extraResponseData>
</searchRetrieveResponse>
```
</details>

2. Get 'other system numbers' from field `035$a`.
<details>
<summary>result</summary>

```
0: "(swissbib)236405489-41slsp_network"
1: "236405489"
2: "(IDSSG)000007681HSB01"
3: "(IDSLU)000189797ILU01"
4: "(NEBIS)000993231EBI01"
5: "(SBT)000737306SBT01"
6: "(RERO)1341820-41slsp"
```
</details>

3. Query for all 143 related records, 50 records per request:
   - `https://eu03.alma.exlibrisgroup.com/view/sru/41SLSP_NETWORK?version=1.2&operation=searchRetrieve&recordSchema=marcxml&query=other_system_number=(swissbib)236405489-41slsp_network%20OR%20other_system_number=236405489%20OR%20other_system_number=(IDSSG)000007681HSB01%20OR%20other_system_number=(IDSLU)000189797ILU01%20OR%20other_system_number=(NEBIS)000993231EBI01%20OR%20other_system_number=(SBT)000737306SBT01%20OR%20other_system_number=(RERO)1341820-41slsp&startRecord=1&maximumRecords=50`

   - `https://eu03.alma.exlibrisgroup.com/view/sru/41SLSP_NETWORK?version=1.2&operation=searchRetrieve&recordSchema=marcxml&query=other_system_number=(swissbib)236405489-41slsp_network%20OR%20other_system_number=236405489%20OR%20other_system_number=(IDSSG)000007681HSB01%20OR%20other_system_number=(IDSLU)000189797ILU01%20OR%20other_system_number=(NEBIS)000993231EBI01%20OR%20other_system_number=(SBT)000737306SBT01%20OR%20other_system_number=(RERO)1341820-41slsp&startRecord=51&maximumRecords=50`

   - `https://eu03.alma.exlibrisgroup.com/view/sru/41SLSP_NETWORK?version=1.2&operation=searchRetrieve&recordSchema=marcxml&query=other_system_number=(swissbib)236405489-41slsp_network%20OR%20other_system_number=236405489%20OR%20other_system_number=(IDSSG)000007681HSB01%20OR%20other_system_number=(IDSLU)000189797ILU01%20OR%20other_system_number=(NEBIS)000993231EBI01%20OR%20other_system_number=(SBT)000737306SBT01%20OR%20other_system_number=(RERO)1341820-41slsp&startRecord=101&maximumRecords=50`

<details>
<summary>result (abbreviated)</summary>

```xml
<?xml version="1.0" encoding="UTF-8" standalone="no"?><searchRetrieveResponse xmlns="http://www.loc.gov/zing/srw/">
  <version>1.2</version>
  <numberOfRecords>143</numberOfRecords>
  <records>
    <record>
      <recordSchema>marcxml</recordSchema>
      <recordPacking>xml</recordPacking>
      <recordData>
        <record xmlns="http://www.loc.gov/MARC21/slim">
          <leader>02032nam a2200481 c 4500</leader>
          <controlfield tag="001">991107550739705501</controlfield>
          <controlfield tag="005">20201222230245.0</controlfield>
          <controlfield tag="008">201012t19901990gw ||||| |||| 00| ||ger d</controlfield>
          <datafield ind1="7" ind2=" " tag="024">
            <subfield code="a">http://catalogue.bnf.fr/ark:/12148/cb35461626k</subfield>
            <subfield code="2">uri</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="035">
            <subfield code="a">(swissbib)238971651-41slsp_network</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="035">
            <subfield code="a">238971651</subfield>
            <subfield code="9">ExL</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="035">
            <subfield code="a">(RERO)1342997-41slsp</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="035">
            <subfield code="a">(NEBIS)000589647EBI01</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="035">
            <subfield code="a">(IDSLU)000119139ILU01</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="040">
            <subfield code="a">RERO nebpun</subfield>
            <subfield code="d">CH-ZuSLS</subfield>
          </datafield>
          <datafield ind1=" " ind2="7" tag="072">
            <subfield code="a">ph</subfield>
            <subfield code="2">rero</subfield>
          </datafield>
          <datafield ind1=" " ind2="7" tag="072">
            <subfield code="a">100</subfield>
            <subfield code="2">IDS LU</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="084">
            <subfield code="a">CI 2600</subfield>
            <subfield code="2">rvk</subfield>
          </datafield>
          <datafield ind1="1" ind2=" " tag="100">
            <subfield code="a">Heidegger, Martin</subfield>
            <subfield code="d">1889-1976</subfield>
            <subfield code="0">(DE-588)118547798</subfield>
            <subfield code="6">880-01</subfield>
          </datafield>
          <datafield ind1="1" ind2=" " tag="880">
            <subfield code="6">100-01</subfield>
            <subfield code="a">Heidegger, Martin</subfield>
            <subfield code="d">1889-1976</subfield>
            <subfield code="0">(IDREF)026917548</subfield>
            <subfield code="4">cre</subfield>
          </datafield>
          <datafield ind1="1" ind2="0" tag="245">
            <subfield code="a">1. Nietzsches Metaphysik</subfield>
            <subfield code="b">2. Einleitung in die Philosophie : Denken und Dichten : [Vorlesung Wintersemester 1941/42 (angekündigt, aber nicht gehalten) und abgebrochene Vorlesung Wintersemester 1944/45]</subfield>
            <subfield code="c">Martin Heidegger ; [hrsg. von Petra Jaeger]</subfield>
          </datafield>
          <datafield ind1="1" ind2=" " tag="246">
            <subfield code="a">Einleitung in die Philosophie</subfield>
          </datafield>
          <datafield ind1=" " ind2="1" tag="264">
            <subfield code="a">Frankfurt am Main</subfield>
            <subfield code="b">V. Klostermann</subfield>
            <subfield code="c">[1990]</subfield>
          </datafield>
          <datafield ind1=" " ind2="4" tag="264">
            <subfield code="c">© 1990</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="300">
            <subfield code="a">VII, 162 S.</subfield>
            <subfield code="b">Faksim.</subfield>
            <subfield code="c">21 cm</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="336">
            <subfield code="b">txt</subfield>
            <subfield code="2">rdacontent</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="337">
            <subfield code="b">n</subfield>
            <subfield code="2">rdamedia</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="338">
            <subfield code="b">nc</subfield>
            <subfield code="2">rdacarrier</subfield>
          </datafield>
          <datafield ind1="1" ind2=" " tag="490">
            <subfield code="a">Gesamtausgabe / Martin Heidegger</subfield>
            <subfield code="v">Bd. 50</subfield>
          </datafield>
          <datafield ind1="1" ind2="7" tag="600">
            <subfield code="a">Nietzsche, Friedrich</subfield>
            <subfield code="d">1844-1900</subfield>
            <subfield code="0">(IDREF)086200038</subfield>
            <subfield code="2">idref</subfield>
          </datafield>
          <datafield ind1="1" ind2="7" tag="600">
            <subfield code="a">Nietzsche, Friedrich</subfield>
            <subfield code="2">idszbz</subfield>
          </datafield>
          <datafield ind1="1" ind2="7" tag="600">
            <subfield code="a">Nietzsche, Friedrich</subfield>
            <subfield code="d">1844-1900</subfield>
            <subfield code="0">(DE-588)118587943</subfield>
            <subfield code="2">gnd</subfield>
          </datafield>
          <datafield ind1=" " ind2="7" tag="650">
            <subfield code="a">Métaphysique</subfield>
            <subfield code="0">(RERO)A021003345</subfield>
            <subfield code="2">rero</subfield>
          </datafield>
          <datafield ind1=" " ind2="7" tag="650">
            <subfield code="a">Metaphysik</subfield>
            <subfield code="2">idszbz</subfield>
          </datafield>
          <datafield ind1=" " ind2="7" tag="650">
            <subfield code="a">Philosophie</subfield>
            <subfield code="2">idszbz</subfield>
          </datafield>
          <datafield ind1=" " ind2="7" tag="650">
            <subfield code="a">ALLGEMEINE METAPHYSIK (PHILOSOPHIE)</subfield>
            <subfield code="9">ger</subfield>
            <subfield code="0">(ETHUDK)000009377</subfield>
            <subfield code="2">ethudk</subfield>
          </datafield>
          <datafield ind1=" " ind2="7" tag="655">
            <subfield code="a">Einführung</subfield>
            <subfield code="2">idszbz</subfield>
          </datafield>
          <datafield ind1="1" ind2="2" tag="700">
            <subfield code="a">Heidegger, Martin</subfield>
            <subfield code="t">Nietzsches Metaphysik</subfield>
          </datafield>
          <datafield ind1="1" ind2="2" tag="700">
            <subfield code="a">Heidegger, Martin</subfield>
            <subfield code="t">Einleitung in die Philosophie</subfield>
          </datafield>
          <datafield ind1="1" ind2=" " tag="700">
            <subfield code="a">Jaeger, Petra</subfield>
            <subfield code="0">(IDREF)028415213</subfield>
          </datafield>
          <datafield ind1="0" ind2="2" tag="740">
            <subfield code="a">2. Einleitung in die Philosophie</subfield>
          </datafield>
          <datafield ind1="1" ind2=" " tag="800">
            <subfield code="a">Heidegger, Martin</subfield>
            <subfield code="d">1889-1976</subfield>
            <subfield code="t">Werke</subfield>
            <subfield code="v">50</subfield>
            <subfield code="w">(IDSLU)000189797ILU01</subfield>
          </datafield>
          <datafield ind1="0" ind2="1" tag="852">
            <subfield code="a">41SLSP_UGE</subfield>
            <subfield code="6">991005417919705502</subfield>
            <subfield code="9">P</subfield>
          </datafield>
          <datafield ind1="0" ind2="1" tag="852">
            <subfield code="a">41SLSP_UZB</subfield>
            <subfield code="6">990005896470205508</subfield>
            <subfield code="9">P</subfield>
          </datafield>
          <datafield ind1="0" ind2="1" tag="852">
            <subfield code="a">41SLSP_ETH</subfield>
            <subfield code="6">990005896470205503</subfield>
            <subfield code="9">P</subfield>
          </datafield>
          <datafield ind1="0" ind2="1" tag="852">
            <subfield code="a">41SLSP_RZS</subfield>
            <subfield code="6">991191390105505</subfield>
            <subfield code="9">P</subfield>
          </datafield>
          <datafield ind1="0" ind2="1" tag="852">
            <subfield code="a">41SLSP_BCUFR</subfield>
            <subfield code="6">991000859769705509</subfield>
            <subfield code="9">P</subfield>
          </datafield>
          <datafield ind1="0" ind2="1" tag="852">
            <subfield code="a">41SLSP_VGE</subfield>
            <subfield code="6">991002129669705524</subfield>
            <subfield code="9">P</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="900">
            <subfield code="a">REROnoselfmerge</subfield>
          </datafield>
        </record>
      </recordData>
      <recordIdentifier>991107550739705501</recordIdentifier>
      <recordPosition>1</recordPosition>
    </record>
    <record>
      <recordSchema>marcxml</recordSchema>
      <recordPacking>xml</recordPacking>
      <recordData>
        <record xmlns="http://www.loc.gov/MARC21/slim">
          <leader>05545nam a2200817 c 4500</leader>
          <controlfield tag="001">991134663009705501</controlfield>
          <controlfield tag="005">20220921201945.0</controlfield>
          <controlfield tag="008">201011s2012    gw            00| | ger|d</controlfield>
          <datafield ind1=" " ind2=" " tag="020">
            <subfield code="a">9783465037255</subfield>
            <subfield code="c">(kt)</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="020">
            <subfield code="a">9783465037262</subfield>
            <subfield code="c">(Ln)</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="035">
            <subfield code="a">(swissbib)218332912-41slsp_network</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="035">
            <subfield code="a">218332912</subfield>
            <subfield code="9">ExL</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="035">
            <subfield code="a">(NEBIS)006908863EBI01</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="035">
            <subfield code="a">(RERO)R006371575-41slsp</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="035">
            <subfield code="a">(IDSBB)005753658DSV01</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="035">
            <subfield code="a">(IDSLU)001023910ILU01</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="035">
            <subfield code="a">(IDSSG)000544914HSB01</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="040">
            <subfield code="a">RERO gevbge</subfield>
            <subfield code="d">CH-ZuSLS</subfield>
          </datafield>
          <datafield ind1=" " ind2="7" tag="072">
            <subfield code="a">ph</subfield>
            <subfield code="2">rero</subfield>
          </datafield>
          <datafield ind1=" " ind2="7" tag="072">
            <subfield code="a">ph</subfield>
            <subfield code="2">SzZuIDS BS/BE</subfield>
          </datafield>
          <datafield ind1=" " ind2="7" tag="072">
            <subfield code="a">100</subfield>
            <subfield code="2">IDS LU</subfield>
          </datafield>
          <datafield ind1="0" ind2="4" tag="082">
            <subfield code="a">193</subfield>
            <subfield code="2">19</subfield>
          </datafield>
          <datafield ind1="1" ind2="4" tag="082">
            <subfield code="a">193</subfield>
            <subfield code="2">22</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="084">
            <subfield code="a">CI 2600</subfield>
            <subfield code="2">rvk</subfield>
          </datafield>
          <datafield ind1="1" ind2=" " tag="100">
            <subfield code="a">Heidegger, Martin</subfield>
            <subfield code="d">1889-1976</subfield>
            <subfield code="0">(DE-588)118547798</subfield>
            <subfield code="6">880-01</subfield>
          </datafield>
          <datafield ind1="1" ind2=" " tag="880">
            <subfield code="6">100-01</subfield>
            <subfield code="a">Heidegger, Martin</subfield>
            <subfield code="d">1889-1976</subfield>
            <subfield code="0">(IDREF)026917548</subfield>
            <subfield code="4">cre</subfield>
          </datafield>
          <datafield ind1="1" ind2="0" tag="245">
            <subfield code="a">&lt;&lt;Der&gt;&gt; Anfang der Abendländischen Philosophie</subfield>
            <subfield code="b">; Auslegung des Anaximander und Parmenides</subfield>
            <subfield code="c">Martin Heidegger ; hrsg. von Peter Trawny</subfield>
          </datafield>
          <datafield ind1=" " ind2="1" tag="264">
            <subfield code="a">Frankfurt am Main</subfield>
            <subfield code="b">Klostermann</subfield>
            <subfield code="c">2012</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="300">
            <subfield code="a">272 S.</subfield>
            <subfield code="c">22 cm</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="336">
            <subfield code="b">txt</subfield>
            <subfield code="2">rdacontent</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="337">
            <subfield code="b">n</subfield>
            <subfield code="2">rdamedia</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="338">
            <subfield code="b">nc</subfield>
            <subfield code="2">rdacarrier</subfield>
          </datafield>
          <datafield ind1="1" ind2=" " tag="490">
            <subfield code="a">Gesamtausgabe / Martin Heidegger</subfield>
            <subfield code="v">Band 35</subfield>
            <subfield code="a">Abt. 2, Vorlesungen 1919-1944</subfield>
          </datafield>
          <datafield ind1="1" ind2=" " tag="490">
            <subfield code="a">Vorlesungen 1919-1944 / Martin Heidegger</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="500">
            <subfield code="a">Freiburger Vorlesung Sommersemester 1932</subfield>
          </datafield>
          <datafield ind1="0" ind2=" " tag="505">
            <subfield code="a">Freiburger Vorlesung Sommersemester 1932</subfield>
          </datafield>
          <datafield ind1="0" ind2="7" tag="600">
            <subfield code="a">Anaximander</subfield>
            <subfield code="2">idszbz</subfield>
          </datafield>
          <datafield ind1="0" ind2="7" tag="600">
            <subfield code="a">Parmenides</subfield>
            <subfield code="2">idszbz</subfield>
          </datafield>
          <datafield ind1="0" ind2="7" tag="600">
            <subfield code="a">Anaximander</subfield>
            <subfield code="c">Milesius</subfield>
            <subfield code="d">v610-v546</subfield>
            <subfield code="0">(DE-588)118645102</subfield>
            <subfield code="2">gnd</subfield>
          </datafield>
          <datafield ind1="0" ind2="7" tag="600">
            <subfield code="a">Parmenides</subfield>
            <subfield code="d">v515-v445</subfield>
            <subfield code="t">De natura</subfield>
            <subfield code="0">(DE-588)4273864-7</subfield>
            <subfield code="2">gnd</subfield>
          </datafield>
          <datafield ind1="0" ind2="0" tag="600">
            <subfield code="a">Anaximander</subfield>
          </datafield>
          <datafield ind1="0" ind2="0" tag="600">
            <subfield code="a">Parmenides</subfield>
          </datafield>
          <datafield ind1="0" ind2="7" tag="600">
            <subfield code="a">Anaximandre</subfield>
            <subfield code="d">0610?-0547? av. J.-C.</subfield>
            <subfield code="0">(IDREF)031250386</subfield>
            <subfield code="2">idref</subfield>
          </datafield>
          <datafield ind1="0" ind2="7" tag="600">
            <subfield code="a">Parménide d'Élée</subfield>
            <subfield code="d">0515?-0440? av. J.-C.</subfield>
            <subfield code="0">(IDREF)027058697</subfield>
            <subfield code="2">idref</subfield>
          </datafield>
          <datafield ind1=" " ind2="7" tag="648">
            <subfield code="a">Geschichte 1932</subfield>
            <subfield code="2">idszbz</subfield>
          </datafield>
          <datafield ind1=" " ind2="7" tag="648">
            <subfield code="a">Geschichte 1900-1950</subfield>
            <subfield code="2">idszbz</subfield>
          </datafield>
          <datafield ind1=" " ind2="7" tag="650">
            <subfield code="a">Philosophie</subfield>
            <subfield code="2">idszbz</subfield>
          </datafield>
          <datafield ind1=" " ind2="7" tag="650">
            <subfield code="a">Logik</subfield>
            <subfield code="0">(DE-588)4036202-4</subfield>
            <subfield code="2">gnd</subfield>
          </datafield>
          <datafield ind1=" " ind2="7" tag="650">
            <subfield code="a">Sein</subfield>
            <subfield code="0">(DE-588)4054329-8</subfield>
            <subfield code="2">gnd</subfield>
          </datafield>
          <datafield ind1=" " ind2="7" tag="650">
            <subfield code="a">Sprache</subfield>
            <subfield code="0">(DE-588)4056449-6</subfield>
            <subfield code="2">gnd</subfield>
          </datafield>
          <datafield ind1=" " ind2="0" tag="650">
            <subfield code="a">Philosophy</subfield>
          </datafield>
          <datafield ind1=" " ind2="0" tag="650">
            <subfield code="a">Pre-Socratic philosophers</subfield>
          </datafield>
          <datafield ind1=" " ind2="7" tag="650">
            <subfield code="a">philosophie - origine</subfield>
            <subfield code="0">(RERO)A010131488</subfield>
            <subfield code="2">rerovoc</subfield>
          </datafield>
          <datafield ind1=" " ind2="7" tag="650">
            <subfield code="a">Philosophie grecque</subfield>
            <subfield code="0">(RERO)A021003850</subfield>
            <subfield code="2">rero</subfield>
          </datafield>
          <datafield ind1=" " ind2="7" tag="655">
            <subfield code="a">Quelle</subfield>
            <subfield code="2">idszbz</subfield>
          </datafield>
          <datafield ind1=" " ind2="7" tag="655">
            <subfield code="a">[Enseignements]</subfield>
            <subfield code="0">(RERO)A025744762</subfield>
            <subfield code="2">rero</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="690">
            <subfield code="a">Auslegung; Übersetzung; Fragment; Einleitung; Satz; Gang; Abgrenzung; Berufung; Entdeckung; Entfaltung; Erfahrung; Erinnerung; Meinung; Philosophie; Transzendenz; Täuschung; Gehalt; Macht; Sprache</subfield>
            <subfield code="2">idssg-J</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="690">
            <subfield code="a">Seinsfrage; Grunderscheinung; Seinsverständnis; Selbsttäuschung; A-Fragment; Daß-Sein; Fragwürdigkeit; Menschsein; Satzstück; So-Sein; Tatbestand; Umrisslosigkeit; Un-Ruhe; Un-Verhältnis; Wahr-Sein; Was-Sein; Zwischenbetrachtung; Erscheinungsgeschichte; Existenzbegriff; Fraglichwerden; Grundfrage; Maßgabe; Nicht-Seiendes; Reihenfolge; Rückgang; Sich-Loslassen; Wesensmacht; Wesenssatz; Zeitsatz; Zur-Herrschaft-Kommen; Frageweise; Fragloseste; Grundgeschehnis; Stellungnahme</subfield>
            <subfield code="2">idssg-J</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="690">
            <subfield code="a">ausdrückliche Entfaltung; möglicher Weg; unzureichende Bedeutung; abendländische Philosophie; abschließende Beurteilung; anderer Spruch; anfänglicher Anfang; anfängliche Frage; begründendes Sagen; bejahend Ofuiaxa; bekanntes Seiendes; bekannte Vielfältigkeit; drittes Kapitel; drittes Stück; dritter Teil; eigene Interpretation; einfach-einzig Selbigkeit; einheitlicher Gehalt; endgültiges Ausbleiben; endgültige Fassung; ermächtigende Macht; erste Besinnung; erster Gang; erste Gruppe; erstes Kapitel; erstes Stück; erster Teil; herrschaftlicher Ausgang; heutige Situation; indirekter Beweis; innere Mitte; innere Zusammengehörigkeit; landläufige Übersetzung; leitende Hinsicht; letzte Frage; nächste Nähe; rechte Wegweisung; rechtlich-sittliche Bedeutung; unbekannt Sem; ungefragte Seinsfrage; unmöglicher Weg; verborgener Anfang; verneinend Af; verschiedene Frageweise; verstandene Unvollendbarkeit; volle Fassung; vorbereitende Besinnung; völlige Entwürdigung; weitere Klärung; wirkliches Fragen; zusammenhängende Entfaltung; zweiter Gang; zweite Gruppe; zweites Kapitel; zweites Satzstück; zweites Stück; zweiter Teil</subfield>
            <subfield code="2">idssg-J</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="690">
            <subfield code="a">Griechenland C4EUGR; Deutschland C4EUGE; Nigeria C6NIGR; Welt C00WOR</subfield>
            <subfield code="2">idssg-J</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="690">
            <subfield code="a">Anaximander; Ede Andere; Existieren Existenz Abgrenzung; Friedrich Nietzsche; Jaspers; Kaiä tfyv toö xpövou; Kierkegaard; Kotö tö xperöv; Martin HEIDEGGER; Parmenides; S. Jahrhundert; Sophokles; Vittorio LOSTERMANN; ÄY vr xov; Äpxtl tcdv övtcov</subfield>
            <subfield code="2">idssg-J</subfield>
          </datafield>
          <datafield ind1="1" ind2=" " tag="700">
            <subfield code="a">Trawny, Peter</subfield>
            <subfield code="d">1964-</subfield>
            <subfield code="0">(DE-588)11563911X</subfield>
            <subfield code="6">880-02</subfield>
          </datafield>
          <datafield ind1="1" ind2=" " tag="880">
            <subfield code="6">700-02</subfield>
            <subfield code="a">Trawny, Peter</subfield>
            <subfield code="d">1964-....</subfield>
            <subfield code="0">(IDREF)035557249</subfield>
          </datafield>
          <datafield ind1="1" ind2="2" tag="700">
            <subfield code="a">Heidegger, Martin</subfield>
            <subfield code="d">1889-1976</subfield>
            <subfield code="t">Auslegung des Anaximander und Parmenides</subfield>
          </datafield>
          <datafield ind1="4" ind2=" " tag="856">
            <subfield code="3">Titelblatt und Inhaltsverzeichnis</subfield>
            <subfield code="u">https://toc.library.ethz.ch/objects/pdf/z01_978-3-465-03725-5_01.pdf</subfield>
            <subfield code="q">pdf</subfield>
          </datafield>
          <datafield ind1="1" ind2=" " tag="800">
            <subfield code="a">Heidegger, Martin</subfield>
            <subfield code="d">1889-1976</subfield>
            <subfield code="t">Werke</subfield>
            <subfield code="v">35</subfield>
            <subfield code="w">(IDSLU)000189797ILU01</subfield>
          </datafield>
          <datafield ind1="1" ind2=" " tag="800">
            <subfield code="a">Heidegger, Martin</subfield>
            <subfield code="d">1889-1976</subfield>
            <subfield code="t">Gesamtausgabe</subfield>
            <subfield code="v">2/35</subfield>
            <subfield code="w">(IDSBB)000104000DSV01</subfield>
          </datafield>
          <datafield ind1="1" ind2=" " tag="800">
            <subfield code="a">Heidegger, Martin</subfield>
            <subfield code="t">Vorlesungen 1919-1944</subfield>
            <subfield code="w">(IDSSG)000278937HSB01</subfield>
          </datafield>
          <datafield ind1="0" ind2="1" tag="852">
            <subfield code="a">41SLSP_UGE</subfield>
            <subfield code="6">991003808989705502</subfield>
            <subfield code="9">P</subfield>
          </datafield>
          <datafield ind1="0" ind2="1" tag="852">
            <subfield code="a">41SLSP_UZB</subfield>
            <subfield code="6">990069088630205508</subfield>
            <subfield code="9">P</subfield>
          </datafield>
          <datafield ind1="0" ind2="1" tag="852">
            <subfield code="a">41SLSP_HSG</subfield>
            <subfield code="6">995449140105506</subfield>
            <subfield code="9">P</subfield>
          </datafield>
          <datafield ind1="0" ind2="1" tag="852">
            <subfield code="a">41SLSP_UBE</subfield>
            <subfield code="6">99116924156605511</subfield>
            <subfield code="9">P</subfield>
          </datafield>
          <datafield ind1="0" ind2="1" tag="852">
            <subfield code="a">41SLSP_RZS</subfield>
            <subfield code="6">9910239100105505</subfield>
            <subfield code="9">P</subfield>
          </datafield>
          <datafield ind1="0" ind2="1" tag="852">
            <subfield code="a">41SLSP_BCUFR</subfield>
            <subfield code="6">991003398079705509</subfield>
            <subfield code="9">P</subfield>
          </datafield>
          <datafield ind1="0" ind2="1" tag="852">
            <subfield code="a">41SLSP_ZBS</subfield>
            <subfield code="6">9957536580105528</subfield>
            <subfield code="9">P</subfield>
          </datafield>
          <datafield ind1="0" ind2="1" tag="852">
            <subfield code="a">41SLSP_VGE</subfield>
            <subfield code="6">991003843939705524</subfield>
            <subfield code="9">P</subfield>
          </datafield>
          <datafield ind1="0" ind2="1" tag="852">
            <subfield code="a">41SLSP_UBS</subfield>
            <subfield code="6">9957536580105504</subfield>
            <subfield code="9">P</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="900">
            <subfield code="a">IDSZ2zbzmon201202f</subfield>
            <subfield code="c">IDSZ2kalh</subfield>
            <subfield code="d">IDSZ2zbzswk201202b</subfield>
            <subfield code="e">IDSZ2somm</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="900">
            <subfield code="a">REROnoselfmerge</subfield>
          </datafield>
          <datafield ind1=" " ind2=" " tag="949">
            <subfield code="a">https://toc.library.ethz.ch/objects/pdf/z01_978-3-465-03725-5_01.pdf</subfield>
          </datafield>
        </record>
      </recordData>
      <recordIdentifier>991134663009705501</recordIdentifier>
      <recordPosition>2</recordPosition>
    </record>
  </records>
  <nextRecordPosition>3</nextRecordPosition>
  <extraResponseData xmlns:xb="http://www.exlibris.com/repository/search/xmlbeans/">
    <xb:exact>true</xb:exact>
    <xb:responseDate>2022-12-22T10:42:31+0100</xb:responseDate>
  </extraResponseData>
</searchRetrieveResponse>
```
</details>
