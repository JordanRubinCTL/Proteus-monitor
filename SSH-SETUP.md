# Host Service Monitoring Setup

This application can monitor services on the Docker host server using SSH.

## Quick Setup

1. **Generate SSH keys:**
   ```bash
   ./setup-ssh-keys.sh
   ```

2. **Add public key to host:**
   Copy the displayed public key and add it to the host's authorized_keys:
   ```bash
   # On the Docker host
   echo 'ssh-rsa AAAA...' >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   ```

3. **Update configuration (if needed):**
   Edit `docker-compose.yml` and change `SSH_HOST` if not using `host.docker.internal`:
   ```yaml
   - SSH_HOST=192.168.1.100  # Your actual host IP
   ```

4. **Build and run:**
   ```bash
   docker-compose up -d --build
   ```

## Configuration

### Environment Variables

- `CHECK_HOST_SERVICES` - Set to `true` to enable SSH-based host monitoring
- `SSH_HOST` - Host IP address (use `host.docker.internal` for Docker Desktop)
- `SSH_USER` - SSH user on host (default: `root`)
- `SSH_KEY_PATH` - Path to SSH private key inside container

### Running without SSH (local development)

If you're running the application directly on the host (not in Docker), services are checked locally without SSH. Simply set:

```bash
CHECK_HOST_SERVICES=false
```

Or remove the environment variable entirely.

## Troubleshooting

### SSH Connection Issues

Test SSH connection from inside the container:
```bash
docker exec -it proteus-chi-monitor ssh -i /home/proteus/.ssh/id_rsa root@host.docker.internal
```

### Permission Denied

Ensure the private key has correct permissions (600):
```bash
chmod 600 ssh-keys/id_rsa
```

### Host IP Not Working

For production servers, replace `host.docker.internal` with the actual host IP address:
```bash
ip addr show  # Find your host IP
```

## Security Notes

- SSH keys are stored securely inside the container with proper permissions (600)
- Keys are owned by the non-root `proteus` user
- The container uses read-only SSH authentication (no passwords)
- Consider using a dedicated monitoring user instead of root on the host
