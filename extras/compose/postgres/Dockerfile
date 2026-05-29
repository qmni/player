FROM postgres:18

# Entferne nicht benötigte Tools (optional, Beispiel)
RUN apt-get update && \
    apt-get remove --purge -y curl wget && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Optional: Sichere Konfigurationen einbinden
# COPY ./postgresql.conf /etc/postgresql/postgresql.conf
# COPY ./pg_hba.conf /etc/postgresql/pg_hba.conf
# RUN chown postgres:postgres /etc/postgresql/postgresql.conf /etc/postgresql/pg_hba.conf