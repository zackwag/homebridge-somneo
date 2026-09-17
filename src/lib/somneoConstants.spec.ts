import { SomneoConstants } from './somneoConstants';

describe('SomneoConstants', () => {
  describe('convertPercentageToPhilipsPercentage', () => {
    it('rounds up to the next Philips step', () => {
      expect(SomneoConstants.convertPercentageToPhilipsPercentage(1)).toBe(1);
      expect(SomneoConstants.convertPercentageToPhilipsPercentage(4)).toBe(1);
      expect(SomneoConstants.convertPercentageToPhilipsPercentage(5)).toBe(2);
      expect(SomneoConstants.convertPercentageToPhilipsPercentage(80)).toBe(20);
      expect(SomneoConstants.convertPercentageToPhilipsPercentage(100)).toBe(25);
    });
  });

  describe('convertPhilipsPercentageToPercentage', () => {
    it('multiplies by the Philips step interval', () => {
      expect(SomneoConstants.convertPhilipsPercentageToPercentage(1)).toBe(4);
      expect(SomneoConstants.convertPhilipsPercentageToPercentage(20)).toBe(80);
      expect(SomneoConstants.convertPhilipsPercentageToPercentage(25)).toBe(100);
    });
  });
});
