import { MetaWallet } from './MetaWallet';
import axios from 'axios';

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('testing wallet endpoints', () => {
  test('testing attachAuthorizeEndpoint', () => {
    mockedAxios.post.mockResolvedValueOnce(1);
    let wallet = new MetaWallet();
    wallet.attachAuthorizeEndpoint('authorizeName', 'authorizeURL');
    expect(wallet.authorizeEndpoints['authorizeName']).toBe('authorizeURL');
  });
  test('testing attachGasStation', () => {
    mockedAxios.post.mockResolvedValueOnce(1);
    let wallet = new MetaWallet();
    wallet.attachGasStation('gasStationName', 'gasStationURL');
    expect(wallet.gasStations['gasStationName']).toBe('gasStationURL');
  });
  test('testing attachGasStation', () => {
    mockedAxios.post.mockResolvedValueOnce(1);
    let wallet = new MetaWallet();
    wallet.attachNonceProvider('nonceProviderName', 'nonceProviderURL');
    expect(wallet.nonceProviders['nonceProviderName']).toBe('nonceProviderURL');
  });
  test('testing attachGasStation', () => {
    mockedAxios.post.mockResolvedValueOnce(1);
    let wallet = new MetaWallet();
    wallet.attachTxBuilder('TxBuilderName', 'TxBuilderURL');
    expect(wallet.TxBuilders['TxBuilderName']).toBe('TxBuilderURL');
  });
});