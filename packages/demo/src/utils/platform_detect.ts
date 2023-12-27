// TODO: More proper detection

export const isMobile = (): boolean => {
  if ('userAgentData' in navigator) {
    if ((navigator.userAgentData as any).mobile) {
      return true;
    }
  }

  if ('userAgent' in navigator) {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('iPhone') ||
      (userAgent.includes('Android') && userAgent.includes('Mobile'))) {
      return true;
    }
  }

  return false;
};

export const isTablet = (): boolean => {
  // Is this correct?
  if (isMobile()) {
    return false;
  }

  if ('userAgent' in navigator) {
    const userAgent = navigator.userAgent;
    // Is this Android device detection correct?
    if (userAgent.includes('iPad') || userAgent.includes('Android')) {
      return true;
    }
  }

  return false;
};
