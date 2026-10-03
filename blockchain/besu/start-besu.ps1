$ErrorActionPreference = 'Stop'
$besuDir = $PSScriptRoot
$networkDir = Join-Path $besuDir 'network'
New-Item -ItemType Directory -Force -Path $networkDir | Out-Null

if (-not (Test-Path (Join-Path $networkDir 'genesis.json'))) {
    Write-Host 'Generating a local four-validator QBFT network...'
    docker run --rm -v "${besuDir}:/config:ro" -v "${networkDir}:/network" hyperledger/besu:24.12.2 operator generate-blockchain-config --config-file=/config/qbftConfigFile.json --to=/network --private-key-file-name=key
    if ($LASTEXITCODE -ne 0) { throw 'Besu network key generation failed.' }
}

$nodeDirs = @(Get-ChildItem (Join-Path $networkDir 'keys') -Directory | Sort-Object Name)
if ($nodeDirs.Count -lt 4) { throw 'The generated QBFT network does not contain four validator keys.' }
$publicKeys = @()
for ($i = 0; $i -lt 4; $i++) {
    $publicKey = ((Get-Content (Join-Path $nodeDirs[$i].FullName 'key.pub') -Raw).Trim() -replace '^0x', '')
    $key = (Get-Content (Join-Path $nodeDirs[$i].FullName 'key') -Raw).Trim()
    [System.IO.File]::WriteAllText((Join-Path $networkDir "validator-$($i + 1).key"), $key)
    $publicKeys += $publicKey
}

for ($i = 0; $i -lt 4; $i++) {
    $peers = @()
    for ($j = 0; $j -lt 4; $j++) {
        if ($i -ne $j) { $peers += "enode://$($publicKeys[$j])@validator$($j + 1):30303" }
    }
    ConvertTo-Json -InputObject $peers | Set-Content -Encoding ascii (Join-Path $networkDir "validator-$($i + 1)-static-nodes.json")
}

docker compose -f (Join-Path $besuDir 'docker-compose.yml') up -d
if ($LASTEXITCODE -ne 0) { throw 'Could not start the local Besu QBFT validators.' }
Write-Host 'Besu QBFT validators started. RPC: http://localhost:8545'


