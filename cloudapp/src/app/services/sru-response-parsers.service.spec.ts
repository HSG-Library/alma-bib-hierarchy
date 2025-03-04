import { TestBed } from '@angular/core/testing';
import { FindDuplicatesService } from './find-duplicates.service';
import { SruResponseParserService } from './sru-response-parsers.service';

describe('SruResponseParserService', () => {
  let service: SruResponseParserService;
  let findDuplicatesService: FindDuplicatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SruResponseParserService, FindDuplicatesService],
    });
    service = TestBed.inject(SruResponseParserService);
    findDuplicatesService = TestBed.inject(FindDuplicatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getRecords', () => {
    it('should extract records from XML string', () => {
      const xmlString = `
        <records xmlns="http://www.loc.gov/MARC21/slim">
          <record>
            <controlfield tag="001">123456</controlfield>
          </record>
          <record>
            <controlfield tag="001">789012</controlfield>
          </record>
        </records>
      `;
      const records = service.getRecords(xmlString);
      expect(records.length).toBe(2);
      expect(
        records[0].getElementsByTagName('controlfield')[0].textContent
      ).toBe('123456');
      expect(
        records[1].getElementsByTagName('controlfield')[0].textContent
      ).toBe('789012');
    });
  });

  describe('getOtherSystemNumbers', () => {
    it('should extract other system numbers from records', () => {
      const xmlString = `
        <records xmlns="http://www.loc.gov/MARC21/slim">
          <record>
            <datafield tag="035">
              <subfield code="a">035a1-1</subfield>
            </datafield>
            <datafield tag="035">
              <subfield code="a">035a1-2</subfield>
            </datafield>
          </record>
          <record>
            <datafield tag="035">
              <subfield code="a">035a2-1</subfield>
            </datafield>
            <datafield tag="035">
              <subfield code="a">035a2-2</subfield>
            </datafield>
          </record>
        </records>
      `;
      const records = service.getRecords(xmlString);
      const otherSystemNumbers = service.getOtherSystemNumbers(records);
      expect(otherSystemNumbers.length).toBe(4);
      expect(otherSystemNumbers).toEqual([
        '035a1-1',
        '035a1-2',
        '035a2-1',
        '035a2-2',
      ]);
    });
  });

  describe('extractHoldings', () => {
    it('should extract holdings 852a from document if only $a is present', () => {
      const xmlString = `
        <records xmlns="http://www.loc.gov/MARC21/slim">
         <record>
            <datafield tag="852">
              <subfield code="a">Holding A1</subfield>
            </datafield>
            <datafield tag="852">
              <subfield code="a">Holding A2</subfield>
            </datafield>
         </record>
        </records>
      `;
      const records = service.getRecords(xmlString);
      const bibInfo = service.getBibInfo(records, []);
      expect(bibInfo).toBeTruthy();
      const holdings = bibInfo[0].holdings;
      expect(holdings).toEqual(['Holding A1', 'Holding A2']);
    });
    it('should extract holdings 852b from document if only $b is present', () => {
      const xmlString = `
        <records xmlns="http://www.loc.gov/MARC21/slim">
         <record>
            <datafield tag="852">
              <subfield code="b">Holding B1</subfield>
            </datafield>
            <datafield tag="852">
              <subfield code="b">Holding B2</subfield>
            </datafield>
         </record>
        </records>
      `;
      const records = service.getRecords(xmlString);
      const bibInfo = service.getBibInfo(records, []);
      expect(bibInfo).toBeTruthy();
      const holdings = bibInfo[0].holdings;
      expect(holdings).toEqual(['Holding B1', 'Holding B2']);
    });
    it('should extract holdings 852a from document if both are present', () => {
      const xmlString = `
        <records xmlns="http://www.loc.gov/MARC21/slim">
         <record>
            <datafield tag="852">
              <subfield code="a">Holding A1</subfield>
              <subfield code="b">Holding B1</subfield>
            </datafield>
            <datafield tag="852">
              <subfield code="a">Holding A2</subfield>
              <subfield code="b">Holding B2</subfield>
            </datafield>
         </record>
        </records>
      `;
      const records = service.getRecords(xmlString);
      const bibInfo = service.getBibInfo(records, []);
      expect(bibInfo).toBeTruthy();
      const holdings = bibInfo[0].holdings;
      expect(holdings).toEqual(['Holding A1', 'Holding A2']);
    });
    it('should extract holdings 852a from document if $a und $b are mixed', () => {
      const xmlString = `
        <records xmlns="http://www.loc.gov/MARC21/slim">
         <record>
            <datafield tag="852">
              <subfield code="b">Holding B1</subfield>
            </datafield>
            <datafield tag="852">
              <subfield code="a">Holding A2</subfield>
            </datafield>
         </record>
        </records>
      `;
      const records = service.getRecords(xmlString);
      const bibInfo = service.getBibInfo(records, []);
      expect(bibInfo).toBeTruthy();
      const holdings = bibInfo[0].holdings;
      expect(holdings).toEqual(['Holding A2']);
    });
  });
});
