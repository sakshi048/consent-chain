package com.consentchain.aggregatorservice.security;

import com.consentchain.aggregatorservice.model.AaDataRequest;
import com.consentchain.aggregatorservice.model.Consent;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ResourceAuthorizationService {
    public void requireRole(AuthenticatedPrincipal principal, String role) {
        if (!principal.hasRole(role)) deny();
    }

    public void requireAccountAccess(Long userId, AuthenticatedPrincipal principal) {
        if (principal.hasRole("ADMIN")) return;
        if (!principal.hasRole("USER") || !principal.userId().equals(userId)) deny();
    }

    public void requireConsentRead(Consent consent, AuthenticatedPrincipal principal) {
        if (principal.hasRole("ADMIN")) return;
        if (principal.hasRole("USER") && principal.userId().equals(consent.getUser().getId())) return;
        if (principal.hasRole("FIU") && principal.institutionId() != null
                && principal.institutionId().equals(consent.getFiuId())) return;
        // This demo has one FIP store shared by the registered FIP portal accounts.
        if (principal.hasRole("FIP")) return;
        deny();
    }

    public void requireConsentOwner(Consent consent, AuthenticatedPrincipal principal) {
        if (!principal.hasRole("USER") || !principal.userId().equals(consent.getUser().getId())) deny();
    }

    public void requireDataRequestRead(AaDataRequest request, AuthenticatedPrincipal principal) {
        if (principal.hasRole("ADMIN")) return;
        if (principal.hasRole("USER") && principal.userId().equals(request.getUserId())) return;
        if (principal.hasRole("FIU") && principal.institutionId() != null
                && principal.institutionId().equals(request.getFiuId())) return;
        // The current demo runs a single FIP institution against the shared bank data store.
        if (principal.hasRole("FIP")) return;
        deny();
    }

    public void requireDataRequestOwner(AaDataRequest request, AuthenticatedPrincipal principal) {
        if (!principal.hasRole("USER") || !principal.userId().equals(request.getUserId())) deny();
    }

    private void deny() {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to access this resource");
    }
}
