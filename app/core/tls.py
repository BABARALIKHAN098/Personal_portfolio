def use_system_trust_store() -> None:
    """Use OS-managed certificate authorities without disabling TLS verification."""
    try:
        import truststore
        truststore.inject_into_ssl()
    except ImportError:
        pass
