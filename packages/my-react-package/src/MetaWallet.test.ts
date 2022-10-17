import { MetaWallet } from './MetaWallet';
import axios from 'axios';

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('testing wallet endpoints', () => {
  let wallet = new MetaWallet();
  let Address = wallet.address;
  test('testing attachAuthorizeEndpoint', () => {
    mockedAxios.post.mockResolvedValueOnce(1);
    wallet.attachAuthorizeEndpoint('authorizeName', 'authorizeURL');
    expect(wallet.authorizeEndpoints['authorizeName']).toBe('authorizeURL');
  });
  test('testing attachGasStation', () => {
    wallet.attachGasStation('gasStationName', 'gasStationURL');
    expect(wallet.gasStations['gasStationName']).toBe('gasStationURL');
  });
  test('testing attachNonceProvider', () => {
    wallet.attachNonceProvider('nonceProviderName', 'nonceProviderURL');
    expect(wallet.nonceProviders['nonceProviderName']).toBe('nonceProviderURL');
  });
  test('testing attachTxBuilder', () => {
    wallet.attachTxBuilder('TxBuilderName', 'TxBuilderURL');
    expect(wallet.TxBuilders['TxBuilderName']).toBe('TxBuilderURL');
  });
});