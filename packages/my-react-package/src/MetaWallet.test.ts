import { MetaWallet } from './MetaWallet';
import axios from 'axios';
import { Wallet } from 'ethers';

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;
let wallet = new MetaWallet();

describe('testing wallet endpoints', () => {
  test('testing attachAuthorizeEndpoint', () => {
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

describe('testing authorize function', () => {
  test('should return true in case of an authorized wallet', async () => {
    mockedAxios.post.mockResolvedValueOnce(
      {
        data: {
          authorize: true,
        },
      }
    );
    wallet.attachAuthorizeEndpoint('authorizeName', 'authorizeURL');
    const isAuthorized = (await wallet.authorize('authorizeName'));
    expect(isAuthorized).toBe(true);
  });
  test('should return false when wallet is not authorized', async () => {
    mockedAxios.post.mockResolvedValueOnce(
      {
        data: {
          authorize: false,
        },
      }
    );
    wallet.attachAuthorizeEndpoint('authorizeName', 'authorizeURL');
    const isAuthorized = (await wallet.authorize('authorizeName'));
    expect(isAuthorized).toBe(false);
  });
  test('should return false when when API call fails', async () => {
    const message = "Network Error";
    mockedAxios.post.mockRejectedValueOnce(new Error(message));
    wallet.attachAuthorizeEndpoint('authorizeName', 'authorizeURL');
    await expect(wallet.authorize('authorizeName')).rejects.toThrow(message);

  });

});