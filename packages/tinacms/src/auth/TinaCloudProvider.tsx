import {
  BaseTextField,
  Branch,
  BranchDataProvider,
  BranchSwitcherPlugin,
  DummyMediaStore,
  MediaStore,
  StaticMedia,
  TinaCMS,
  TinaMediaStore,
  TinaProvider,
  useLocalStorage,
} from '@tinacms/toolkit';
import React, { useEffect, useState } from 'react';
import { ModalBuilder } from './AuthModal';

import { TinaAdminApi } from '../admin/api';
import {
  Client,
  LocalSearchClient,
  TinaCMSSearchClient,
  TinaIOConfig,
} from '../internalClient';
import { CreateClientProps, createClient } from '../utils';
import { useTinaAuthRedirect } from './useTinaAuthRedirect';

type ModalNames = null | 'authenticate' | 'error';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface TinaCloudMediaStoreClass {
  new (client: Client): MediaStore;
}
export interface TinaCloudAuthWallProps {
  cms?: TinaCMS;
  children: React.ReactNode;
  tinaioConfig?: TinaIOConfig;
  getModalActions?: (args: {
    closeModal: () => void;
  }) => { name: string; action: () => Promise<void>; primary: boolean }[];
  mediaStore?:
    | TinaCloudMediaStoreClass
    | (() => Promise<TinaCloudMediaStoreClass>);
}

const AuthWallInner = ({
  children,
  cms,
  getModalActions,
}: TinaCloudAuthWallProps) => {
  const client: Client = cms.api.tina;
  // Whether we are using TinaCloud for auth
  const isTinaCloud = true;
  // !client.isLocalMode &&
  // !client.schema?.config?.config?.contentApiUrlOverride;
  const loginStrategy = client.authProvider.getLoginStrategy();
  const loginScreen = client.authProvider.getLoginScreen();
  if (loginStrategy === 'LoginScreen' && !loginScreen) {
    throw new Error(
      'LoginScreen is set as the login strategy but no login screen component was provided'
    );
  }

  const [activeModal, setActiveModal] = useState<ModalNames>(null);
  const [errorMessage, setErrorMessage] = useState<
    { title: string; message: string } | undefined
  >();
  const [showChildren, setShowChildren] = useState<boolean>(false);
  const [authProps, setAuthProps] = useState<{
    username: string;
    password: string;
  }>({ username: '', password: '' });
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  React.useEffect(() => {
    let mounted = true;
    client.authProvider
      .isAuthenticated()
      .then((isAuthenticated) => {
        if (!mounted) return;
        if (isAuthenticated) {
          client.authProvider
            .isAuthorized()
            .then(async (isAuthorized) => {
              if (!mounted) return;
              if (isAuthorized) {
                const user = await client.authProvider.getUser();
                if (user.passwordChangeRequired) {
                  window.location.hash = '#/screens/change_password';
                }
                setShowChildren(true);
                cms.enable();
              } else {
                setErrorMessage({
                  title: 'Access Denied:',
                  message: 'Not Authorized To Edit',
                });
                setActiveModal('error');
              }
            })
            .catch((e) => {
              if (!mounted) return;
              console.error(e);
              setErrorMessage({ title: 'Unexpected Error:', message: `${e}` });
              setActiveModal('error');
            });
        } else {
          // FIXME: might be some sort of race-condition when loading styles
          sleep(500).then(() => {
            setActiveModal('authenticate');
          });
        }
      })
      .catch((e) => {
        if (!mounted) return;
        console.error(e);
        setErrorMessage({ title: 'Unexpected Error:', message: `${e}` });
        setActiveModal('error');
      });
    return () => {
      mounted = false;
    };
  }, [authenticated]);

  const onAuthenticated = async () => {
    setAuthenticated(true);
    setActiveModal(null);
    cms.events.dispatch({ type: 'cms:login' });
  };

  const otherModalActions = getModalActions
    ? getModalActions({
        closeModal: () => {
          setActiveModal(null);
        },
      })
    : [];

  const handleAuthenticate = async (
    loginScreenProps?: Record<string, string>
  ) => {
    try {
      setAuthenticated(false);
      const token = await client.authProvider.authenticate(
        loginScreenProps || authProps
      );
      if (typeof client?.onLogin === 'function') {
        await client?.onLogin({ token });
      }
      return onAuthenticated();
    } catch (e) {
      console.error(e);
      setActiveModal('error');
      setErrorMessage({
        title: 'Authentication Error',
        message: `${e}`,
      });
    }
  };

  let modalTitle = 'Let’s get you editing with TinaCMS...';
  if (
    activeModal === 'authenticate' &&
    loginStrategy === 'Redirect' &&
    !isTinaCloud
  ) {
    modalTitle = 'Enter into edit mode';
  } else if (
    activeModal === 'authenticate' &&
    loginStrategy === 'UsernamePassword'
  ) {
    modalTitle = 'Let’s get you editing with TinaCMS...';
  } else if (activeModal === 'error') {
    if (loginStrategy === 'Redirect' && !isTinaCloud) {
      modalTitle = 'Enter into edit mode';
    } else if (loginStrategy === 'UsernamePassword') {
      modalTitle = 'Let’s get you editing with TinaCMS...';
    }
  }

  const base64 =
    'iVBORw0KGgoAAAANSUhEUgAAAJYAAAFgCAMAAABuY3BgAAADAFBMVEVfWGM8P1To5uPs6ODk4dy3WzHj3NlmZ23TzsVaWWR1bm+ZeFrAkEixqqjEiE0QFijk39Xj3togLE7PxsVJSljwu3kHCQ9OS04YIjwuOlhfa44yMTbl4+KwrKowMDbCmG1UXHYtMDurfUDXZymtTBzthzuqiGPl4+Du6uFuRjB4cm/FwLweHBqxpKIVGCIzMkP007Ln498iKz2inZwzPl5RXn+0r6zXmmDTsoq6ta/Evra/vr6HhoixZTzj3tocJ0RtOSTQdUHf2tcTEQ5FQDzXz85ybnQpJiPLxr4xPmLpllQTFRkiJzPr6OGxjox1W0BWUU9dW2Hr6eChnqCGaGdVV101IBfs6ePElJDLy9RELyWgWT2LhYfp5NrR0ddFPjz18ekiL1JRXHw+S3ZGUG2JhYSal5aJg4aNg4AkDwpPXYReW1sOCwgEBAS4uL6khYSvj44kMlbs6eGIf3+qqrKRQB21ekIiK0PNYiivoZxNWnaViozg3t/k4N0nKjl9dXVXWmhaPjQoMk+HiJEyO1inko/Nw77i3tzMpHiTkpiUjI4TGi0lLkne2tbidC7gwZR1cW0XIDdHS17Iklj0kkTvxqbX0skiJjbmfDPs6eBHRUsGChRye5tlYWDgqGLs6uMYGiU3MS4vKyd8d3eysbfQqqUaJUApKS/g2tBgWVYdIS2TioOOhYc4RWskIR5NSEfHopiakoypp6eKTTUnLD0MDxrbbSywk5Di3tssOVwoNVuZcnpaaJI8ODbb1s3Uz9LPysK3qKQ+Sms7SHAyOFQZGBXT1N2NcXDR0drXubJOSUqDf3+ZmZ6PaUjm498VHTMdHyy8tLQdKUhESFXHwryKgnoaHy3AubTwqlSioqljXFvX198KCw9raGlAPkowPF7Kwb9LRk7f3+UsGRGAe34NEiEUGCOOjJBIIRNxcHilfoCimpMrNVREUnxcLB3Xz8zg2dTl4t81QWY8Q1+4rqi9vsfDVyEuMkJsZ2jExMzAurOxg0Y2OUksKzbgycF/ZE1nqqggAAABAHRSTlMAkobEYf8el/+Izf+14f///z7/DP//5mf/7uC8qv7k/sE7kf////7a///i2f+V4/7/c83h1du3///////j/y7//v9O//8TBP////+2frf9/v4c5//8Uv+R//3//1r//8f//9H////YyH7//rH//v/c5//upv///////+9EWGlVKv////69Y7+A//+N///////+/3b////////NE//////zmv/////+/9n//8X/s////v7///+p///DNv///v7+/5j/cOT////F4Nr/2v///uP//33/RP84ap7//+X/zf/+/xmm//8J///////+/v///yhHnv///v//J3P+/t2G//7/pwqK1QAAQsdJREFUeNrsmAGkKlkYx1OZzSMmB6AAdO0II2K6axBzBA3vvsttuWXB3gf2pgdG5YEmLgMwhBWI2Iu7QfGYCl732hUx1+DBkQMKTQy8kP2me5e1tx7gXOx+qcY5g5/f9+87msB/vP4vjHEAH1r111+NCRFOVvCLdaoQjqDXwqJkmKs3ZPpiA61dNycT+hpgmHKxcHBz0cAvsdyG46TcNcKvQeW24qHPhRb9905AyTm6EM1MHtlzUZJr6clku3DIVn0k3EvAtUasXZGcI2THkbaQe7mJchth6yV8XxgzxVKGov4wNmdtnTuwK4OtrKelnSbBLKmQ3NAfHnZn94UROgTtCHZ2q2np25rCkIuuJ5nuw24XGumxQ/uoLsyy3p2mDm7WlB2VEnPuHgBLH2XWB23GdDsraZqaHjSZ6cIgK+oBVlvXHXQ4ek4yL3nAVUnVKCMqrLgZwe/hrCDk8GGf9Xvb9jRVU6/ff8SshsO8cudjJdsZ+cg9Qz2b9VaqqlY+1BAjLEgWRMvaVZMZ5cg9XGY7ljS1qC6v3hPMZmZNKloXbPFVb06P3dPwbFsDW8vrm0fMZjo4qk9l8aZQx0ewUFM4zXtaEbp4dakwGaXuoHi3x0rqw6Pssr7NbzWwxaiLmEwg8H4PeSmzPorFOVJ2p6lL6OKHRxZYXOoZqyc45HgARQHCBbKW17cMfouY1hy16GP9ZAqpb2A1hG3e87E+XbGY9LQ2UPfZKo2jc+V4AueCZHdVFbCmzY8MEt8cPNk6yaYn38AKC5JvC2p6wyDzyL1+stWRfp6gvynwP5GwjwVN3D418fz9IwtbT1iWmUg/Y2GKEAoAzNMbIQzZmt9LkrTHmt4wOBafsbq9SCI9f7ZFEUfQM1WAEoIwVcR7z/MACrDgtGZqa06e1zg5xtEApQqliAxlgijXkhJ9bfkJaspinqLaYFmEzFtjL50i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';
  return (
    <>
      {true && (
        // activeModal === 'authenticate' && loginStrategy === 'Redirect' && (

        <ModalBuilder
          title={modalTitle}
          message={
            isTinaCloud ? (
              <img
                src={`data:image/png;base64,${base64}`}
                alt='TinaCMS Security Illustration'
                style={{ maxWidth: '100%', margin: '0 auto', display: 'block' }}
              />
            ) : (
              'When you save, changes will be saved to the local filesystem.'
            )
          }
          close={close}
          actions={[
            ...otherModalActions,
            {
              name: isTinaCloud ? 'Log in' : 'Enter Edit Mode',
              action: handleAuthenticate,
              primary: true,
            },
          ]}
        ></ModalBuilder>
      )}
      {activeModal === 'authenticate' &&
        loginStrategy === 'UsernamePassword' && (
          <ModalBuilder
            title={modalTitle}
            message={''}
            close={close}
            actions={[
              ...otherModalActions,
              {
                name: 'Login',
                action: handleAuthenticate,
                primary: true,
              },
            ]}
          >
            <div className='flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8'>
              <div className='max-w-md w-full space-y-6'>
                <label className='block'>
                  <span className='text-gray-700'>Username</span>
                  <BaseTextField
                    id='username'
                    name='username'
                    type='text'
                    autoComplete='username'
                    required
                    placeholder='Username'
                    value={authProps.username}
                    onChange={(e) =>
                      setAuthProps((prevState) => ({
                        ...prevState,
                        username: e.target.value,
                      }))
                    }
                  />
                </label>
                <label className='block'>
                  <span className='text-gray-700'>Password</span>
                  <BaseTextField
                    id='password'
                    name='password'
                    type='password'
                    autoComplete='current-password'
                    required
                    placeholder='Password'
                    value={authProps.password}
                    onChange={(e) =>
                      setAuthProps((prevState) => ({
                        ...prevState,
                        password: e.target.value,
                      }))
                    }
                  />
                </label>
              </div>
            </div>
          </ModalBuilder>
        )}
      {activeModal === 'error' && errorMessage && (
        <ModalBuilder
          title={modalTitle}
          message={errorMessage.title}
          error={errorMessage.message}
          close={close}
          actions={[
            ...otherModalActions,
            {
              name: 'Retry',
              action: async () => {
                try {
                  setActiveModal(null);
                  setErrorMessage(undefined);
                  const { authProvider } = client;
                  await authProvider.logout();
                  if (typeof client?.onLogout === 'function') {
                    await client.onLogout();
                    await new Promise((resolve) => setTimeout(resolve, 500));
                  }
                  window.location.href = new URL(window.location.href).pathname;
                } catch (e) {
                  console.error(e);
                  setActiveModal('error');
                  setErrorMessage({
                    title: 'Unexpected Error:',
                    message: `${e}`,
                  });
                }
              },
              primary: true,
            },
          ]}
        />
      )}
      {showChildren
        ? children
        : client.authProvider?.getLoginStrategy() === 'LoginScreen' &&
            loginScreen
          ? loginScreen({
              handleAuthenticate: async (props: Record<string, string>) =>
                handleAuthenticate(props),
            })
          : null}
    </>
  );
};

/**
 * Provides the ability to setup your CMS and media while also providing an authentication wall so Tina is not enabled without a valid user session.
 *
 * Note: this will not restrict access for local filesystem clients
 */
export const TinaCloudProvider = (
  props: TinaCloudAuthWallProps &
    CreateClientProps & {
      cmsCallback?: (cms: TinaCMS) => TinaCMS;
      staticMedia: StaticMedia;
    }
) => {
  const baseBranch = props.branch || 'main';
  const [currentBranch, setCurrentBranch] = useLocalStorage(
    'tinacms-current-branch',
    baseBranch
  );
  useTinaAuthRedirect();
  const cms = React.useMemo(
    () =>
      props.cms ||
      new TinaCMS({
        enabled: true,
        sidebar: true,
        isLocalClient: props.isLocalClient,
        isSelfHosted: props.isSelfHosted,
        clientId: props.clientId,
      }),
    [props.cms]
  );
  if (!cms.api.tina) {
    cms.registerApi('tina', createClient({ ...props, branch: currentBranch }));
  } else {
    cms.api.tina.setBranch(currentBranch);
  }

  useEffect(() => {
    let searchClient;
    // if local and search is configured then we always use the local client
    // if not local, then determine if search is enabled and use the client from the config
    if (props.isLocalClient) {
      searchClient = new LocalSearchClient(cms.api.tina);
    } else {
      const hasTinaSearch = Boolean(props.schema.config?.search?.tina);
      if (hasTinaSearch) {
        searchClient = new TinaCMSSearchClient(
          cms.api.tina,
          props.schema.config?.search?.tina
        );
      } else {
        searchClient = props.schema.config?.search?.searchClient;
      }
    }

    if (searchClient) {
      cms.registerApi('search', searchClient);
    }
  }, [props]);

  if (!cms.api.admin) {
    cms.registerApi('admin', new TinaAdminApi(cms));
  }

  const setupMedia = async (staticMedia: StaticMedia) => {
    const hasTinaMedia = Boolean(props.schema.config?.media?.tina);

    /*
     Has tina media (set up in the schema)
    */
    if (hasTinaMedia) {
      cms.media.store = new TinaMediaStore(cms, staticMedia);
    } else if (
      /*
     Has tina custom media (set up in the schema or define schema)
      */
      props.schema.config?.media?.loadCustomStore ||
      props.mediaStore
    ) {
      // Check to see if the media was store was passed in?
      const mediaStoreFromProps =
        props.schema.config?.media?.loadCustomStore || props.mediaStore;
      if (mediaStoreFromProps.prototype?.persist) {
        // @ts-ignore
        cms.media.store = new mediaStoreFromProps(cms.api.tina);
      } else {
        // This means that an async function was passed in so we will use that to get the class

        // @ts-ignore
        const MediaClass = await mediaStoreFromProps();
        cms.media.store = new MediaClass(cms.api.tina);
      }
    } else {
      /** Default MediaStore */
      cms.media.store = new DummyMediaStore();
    }
  };
  const client: Client = cms.api.tina;
  // Weather or not we are using TinaCloud for auth
  const isTinaCloud =
    !client.isLocalMode &&
    !client.schema?.config?.config?.contentApiUrlOverride;
  const SessionProvider = client.authProvider.getSessionProvider();

  const handleListBranches = async (): Promise<Branch[]> => {
    const branches = await cms.api.tina.listBranches({
      includeIndexStatus: true,
    });

    if (!Array.isArray(branches)) {
      return [];
    }
    // @ts-ignore
    return branches;
  };
  const handleCreateBranch = async (data) => {
    const newBranch = await cms.api.tina.createBranch(data);

    return newBranch;
  };

  setupMedia(props.staticMedia).catch((e) => {
    console.error(e);
  });

  const [branchingEnabled, setBranchingEnabled] = React.useState(() =>
    cms.flags.get('branch-switcher')
  );
  React.useEffect(() => {
    cms.events.subscribe('flag:set', ({ key, value }) => {
      if (key === 'branch-switcher') {
        setBranchingEnabled(value);
      }
    });
  }, [cms.events]);

  React.useEffect(() => {
    let branchSwitcher;
    if (branchingEnabled) {
      branchSwitcher = new BranchSwitcherPlugin({
        listBranches: handleListBranches,
        createBranch: handleCreateBranch,
        chooseBranch: setCurrentBranch,
      });
      cms.plugins.add(branchSwitcher);
    }
    return () => {
      if (branchingEnabled && branchSwitcher) {
        cms.plugins.remove(branchSwitcher);
      }
    };
  }, [branchingEnabled, props.branch]);

  React.useEffect(() => {
    if (props.cmsCallback) {
      props.cmsCallback(cms);
    }
  }, []);

  React.useEffect(() => {
    const setupEditorialWorkflow = () => {
      client.getProject().then((project) => {
        if (project?.features?.includes('editorial-workflow')) {
          cms.flags.set('branch-switcher', true);
          client.usingEditorialWorkflow = true;
          client.protectedBranches = project.protectedBranches;

          // if the current branch is not in the metadata,
          // switch to the default branch
          if (!project.metadata[currentBranch]) {
            setCurrentBranch(project.defaultBranch || 'main');
          }
        }
      });
    };
    if (isTinaCloud) {
      setupEditorialWorkflow();
    }
    // If the user logs in after the cms is initialized
    const unsubscribe = cms.events.subscribe('cms:login', () => {
      if (isTinaCloud) {
        setupEditorialWorkflow();
      }
    });
    return unsubscribe;
  }, [currentBranch, isTinaCloud, cms]);

  return (
    <SessionProvider basePath='/api/tina/auth'>
      <BranchDataProvider
        currentBranch={currentBranch}
        setCurrentBranch={(b) => {
          setCurrentBranch(b);
        }}
      >
        <TinaProvider cms={cms}>
          <AuthWallInner {...props} cms={cms} />
        </TinaProvider>
      </BranchDataProvider>
    </SessionProvider>
  );
};

/**
 * @deprecated Please use `TinaCloudProvider` instead
 */
export const TinaCloudAuthWall = TinaCloudProvider;
