describe('DHIS2 Maps-gl Map', () => {
  it('should initialize correctly', () => {
    const Mock = jest.fn(() => ({
      // tslint:disable-next-line:label-position
      // tslint:disable-next-line:no-unused-expression
      Dhis2Map: ({ container }) => ({
        container,
        on: jest.fn()
      })
    }));

    const map = new Mock().Dhis2Map({ container: 'el' });
    expect(map.on).toHaveBeenCalledTimes(0);
    expect(map.container).toBe('el');
  });
});
